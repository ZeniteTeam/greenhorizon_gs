"""Leaf photo diagnosis with Gemini, guarded by a daily request cap and a per-photo cache.

Gemini is only called when a farmer sends a photo, once per distinct photo. The cap keeps
the project inside the free tier; it resets at midnight Pacific time, like Google's quota.
"""

import hashlib
import json
import threading
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import BaseModel, Field

from settings import get_settings

QUOTA_TIMEZONE = ZoneInfo("America/Los_Angeles")

CANDIDATES: dict[str, list[str]] = {
    "Soja": [
        "Ferrugem asiática (Phakopsora pachyrhizi)",
        "Mancha-alvo (Corynespora cassiicola)",
        "Crestamento foliar de Cercospora (Cercospora kikuchii)",
        "Oídio (Erysiphe diffusa)",
        "Antracnose (Colletotrichum truncatum)",
        "Septoriose / mancha-parda (Septoria glycines)",
        "Míldio (Peronospora manshurica)",
        "Dano de inseto ou lagarta",
    ],
    "Milho": [
        "Cercosporiose (Cercospora zeae-maydis)",
        "Ferrugem polissora (Puccinia polysora)",
        "Ferrugem comum (Puccinia sorghi)",
        "Helmintosporiose / mancha-de-turcicum (Exserohilum turcicum)",
        "Mancha-branca (Phaeosphaeria maydis / Pantoea ananatis)",
        "Enfezamento (molicutes transmitidos pela cigarrinha)",
        "Dano de inseto ou lagarta",
    ],
    "Arroz": [
        "Brusone (Pyricularia oryzae)",
        "Mancha-parda (Bipolaris oryzae)",
        "Escaldadura (Microdochium oryzae)",
        "Mancha-estreita (Cercospora janseana)",
        "Dano de inseto",
    ],
}

SYSTEM_INSTRUCTION = """\
Você ajuda produtores da agricultura familiar no Brasil a entender uma foto de folha da lavoura.
Regras:
- Escreva em português simples, frases curtas, sem jargão técnico. Quem lê pode ter pouca escolaridade.
- Dê o nome popular da doença em `label` e o nome científico em `scientificName`.
- Se a foto não mostrar uma folha com nitidez, use label "Foto não permite identificar" e peça outra foto em whatToDo.
- Se a folha parecer sadia, use label "Folha sadia".
- `confidence` e as confianças em `alternatives` são a sua estimativa entre 0 e 1; não exagere.
- Nunca recomende produto, marca ou dose de defensivo.
- Sempre oriente confirmar com um técnico da Emater ou da cooperativa antes de aplicar qualquer coisa.
- `caution` deve deixar claro que isto é uma suspeita, não uma receita.
"""


class ClassScore(BaseModel):
    label: str
    confidence: float = Field(ge=0, le=1)


class PlainExplanation(BaseModel):
    summary: str = Field(description="2 a 4 frases explicando o que a foto mostra e o que o satélite viu.")
    whatToDo: list[str] = Field(description="3 a 5 passos práticos, um por item.")
    caution: str


class GeminiDiagnosis(BaseModel):
    label: str
    scientificName: str
    confidence: float = Field(ge=0, le=1)
    alternatives: list[ClassScore] = Field(description="Até 3 outras possibilidades, da mais para a menos provável.")
    explanation: PlainExplanation


class DiagnosisContext(BaseModel):
    crop: str
    stage: str | None = None
    municipality: str | None = None
    vigorDropPct: float | None = None
    windowDays: int | None = None
    rainVsNormalPct: float | None = None
    nearbyOutbreaks: list[str] = []


class DailyLimitReached(Exception):
    pass


class DiagnosisUnavailable(Exception):
    pass


_lock = threading.Lock()


def _data_dir() -> Path:
    path = get_settings().data_dir
    (path / "diagnoses").mkdir(parents=True, exist_ok=True)
    return path


def _reserve_request() -> None:
    """Counts one Gemini request for today, refusing when the daily cap is reached."""
    usage_file = _data_dir() / "gemini_usage.json"
    today = datetime.now(QUOTA_TIMEZONE).date().isoformat()
    with _lock:
        usage = json.loads(usage_file.read_text()) if usage_file.exists() else {}
        count = usage.get("count", 0) if usage.get("date") == today else 0
        if count >= get_settings().gemini_daily_limit:
            raise DailyLimitReached()
        usage_file.write_text(json.dumps({"date": today, "count": count + 1}))


def usage_today() -> dict:
    usage_file = _data_dir() / "gemini_usage.json"
    today = datetime.now(QUOTA_TIMEZONE).date().isoformat()
    usage = json.loads(usage_file.read_text()) if usage_file.exists() else {}
    used = usage.get("count", 0) if usage.get("date") == today else 0
    return {"date": today, "used": used, "limit": get_settings().gemini_daily_limit}


def _prompt(context: DiagnosisContext) -> str:
    lines = [f"Cultura: {context.crop}."]
    if context.stage:
        lines.append(f"Fase da cultura: {context.stage}.")
    if context.municipality:
        lines.append(f"Região: {context.municipality}.")
    if context.vigorDropPct is not None:
        lines.append(
            f"O satélite viu esta parte da lavoura perder {abs(context.vigorDropPct):.0f}% de vigor (NDVI)"
            f" em {context.windowDays or 10} dias."
        )
    if context.rainVsNormalPct is not None:
        lines.append(f"Chuva dos últimos 30 dias: {context.rainVsNormalPct:.0f}% da média histórica.")
    if context.nearbyOutbreaks:
        lines.append("Focos confirmados na região: " + "; ".join(context.nearbyOutbreaks) + ".")
    candidates = CANDIDATES.get(context.crop)
    if candidates:
        lines.append("Possibilidades mais comuns para esta cultura: " + "; ".join(candidates) + ".")
    lines.append("Analise a foto da folha e responda no formato pedido.")
    return "\n".join(lines)


MOCK_LATENCY_S = 1.5

# Scripted answers used when GEMINI_MOCK=true, one per crop.
MOCK_DIAGNOSES: dict[str, tuple[str, str, float, list[tuple[str, float]]]] = {
    "Soja": (
        "Ferrugem asiática",
        "Phakopsora pachyrhizi",
        0.82,
        [("Mancha-alvo", 0.09), ("Crestamento foliar de Cercospora", 0.05)],
    ),
    "Milho": (
        "Cercosporiose",
        "Cercospora zeae-maydis",
        0.78,
        [("Ferrugem polissora", 0.12), ("Helmintosporiose", 0.06)],
    ),
    "Arroz": (
        "Brusone",
        "Pyricularia oryzae",
        0.80,
        [("Mancha-parda", 0.11), ("Escaldadura", 0.05)],
    ),
}


def _mock_diagnosis(photo: bytes, context: DiagnosisContext) -> dict:
    time.sleep(MOCK_LATENCY_S)
    label, scientific, confidence, alternatives = MOCK_DIAGNOSES.get(context.crop, MOCK_DIAGNOSES["Soja"])
    satellite = (
        f" O satélite viu esta parte da lavoura perder {abs(context.vigorDropPct):.0f}% de vigor"
        f" em {context.windowDays or 10} dias."
        if context.vigorDropPct is not None
        else ""
    )
    return {
        "label": label,
        "scientificName": scientific,
        "confidence": confidence,
        "alternatives": [{"label": alt, "confidence": score} for alt, score in alternatives],
        "explanation": {
            "summary": f"A folha mostra manchas pequenas típicas de {label.lower()}.{satellite}",
            "whatToDo": [
                "Caminhe pela área marcada no mapa e veja se as manchas aparecem em outras plantas.",
                "Tire mais fotos de folhas de baixo e do meio da planta.",
                "Chame o técnico da Emater ou da cooperativa para confirmar.",
                "Avise os vizinhos se a suspeita for confirmada.",
            ],
            "caution": "Isto é uma suspeita, não uma receita. Não aplique nenhum produto sem orientação técnica.",
        },
        "model": "Diagnóstico simulado (modo demonstração)",
        "photoSha256": hashlib.sha256(photo).hexdigest(),
    }


def diagnose(photo: bytes, mime_type: str, context: DiagnosisContext) -> dict:
    settings = get_settings()
    if settings.gemini_mock:
        return _mock_diagnosis(photo, context)
    if not settings.gemini_api_key:
        raise DiagnosisUnavailable("GEMINI_API_KEY não configurada no serviço de cálculos.")

    digest = hashlib.sha256(photo).hexdigest()
    cached = _data_dir() / "diagnoses" / f"{digest}.json"
    if cached.exists():
        return json.loads(cached.read_text(encoding="utf-8"))

    _reserve_request()
    client = genai.Client(api_key=settings.gemini_api_key)
    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[types.Part.from_bytes(data=photo, mime_type=mime_type), _prompt(context)],
            config={
                "system_instruction": SYSTEM_INSTRUCTION,
                "response_mime_type": "application/json",
                "response_json_schema": GeminiDiagnosis.model_json_schema(),
            },
        )
    except genai_errors.APIError as error:
        if error.code == 429:
            raise DailyLimitReached() from error
        raise DiagnosisUnavailable(f"Gemini respondeu com erro {error.code}.") from error

    if not response.text:
        raise DiagnosisUnavailable("Gemini não devolveu uma resposta para esta foto.")
    parsed = GeminiDiagnosis.model_validate_json(response.text)

    result = {
        **parsed.model_dump(),
        "model": f"Gemini ({settings.gemini_model}) · confiança estimada pelo modelo",
        "photoSha256": digest,
    }
    cached.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    return result
