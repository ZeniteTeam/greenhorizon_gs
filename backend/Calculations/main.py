"""Internal calculation service. Only the Java backend (Horizon) calls these endpoints."""

from contextlib import asynccontextmanager
from datetime import date
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

import Snippet
import earth_engine
import field_analysis
import leaf_diagnosis

ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
MAX_PHOTO_BYTES = 15 * 1024 * 1024


@asynccontextmanager
async def lifespan(_: FastAPI):
    earth_engine.initialize()
    yield


app = FastAPI(title="Green Horizon · Calculations", lifespan=lifespan)


class Point(BaseModel):
    longitude: float
    latitude: float


class CalculateRequest(BaseModel):
    points: list[Point]
    startDate: date | None = None
    endDate: date | None = None


class AnalyzeFieldRequest(BaseModel):
    boundary: list[tuple[float, float]]  # [lat, lng]
    plantedAt: date
    until: date
    focusZone: list[tuple[float, float]] | None = None


class TileRequest(BaseModel):
    boundary: list[tuple[float, float]]  # [lat, lng]
    date: date
    layer: field_analysis.Layer
    previousDate: date | None = None


# Plain `def` routes run in FastAPI's thread pool, so slow Earth Engine calls do not block the server.


@app.post("/calculate")
def calculate(request: CalculateRequest):
    try:
        return Snippet.calculate(request.points, request.startDate, request.endDate)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/fields/analyze")
def analyze_field(request: AnalyzeFieldRequest):
    try:
        return field_analysis.analyze_field(request.boundary, request.plantedAt, request.until, request.focusZone)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/fields/tiles")
def field_tiles(request: TileRequest):
    try:
        url = field_analysis.tile_url(request.boundary, request.date, request.layer, request.previousDate)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return {"url": url}


@app.post("/leaf/diagnose")
def diagnose_leaf(
    photo: Annotated[UploadFile, File()],
    context: Annotated[str, Form(description="JSON de DiagnosisContext")],
):
    if photo.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(status_code=415, detail="Envie a foto em JPG, PNG, WEBP ou HEIC.")
    content = photo.file.read(MAX_PHOTO_BYTES + 1)
    if len(content) > MAX_PHOTO_BYTES:
        raise HTTPException(status_code=413, detail="A foto é grande demais (máximo 15 MB).")

    parsed_context = leaf_diagnosis.DiagnosisContext.model_validate_json(context)
    try:
        return leaf_diagnosis.diagnose(content, photo.content_type, parsed_context)
    except leaf_diagnosis.DailyLimitReached as error:
        raise HTTPException(
            status_code=429,
            detail="Limite diário de diagnósticos por foto atingido. Tente novamente amanhã.",
        ) from error
    except leaf_diagnosis.DiagnosisUnavailable as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.get("/leaf/usage")
def leaf_usage():
    return leaf_diagnosis.usage_today()
