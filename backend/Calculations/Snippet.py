"""One-off NDVI analysis of a drawn area (the original "Análise" screen)."""

from datetime import date, timedelta

import ee

from earth_engine import PIXEL_SCALE_M, polygon, sentinel_collection, with_indices

DEFAULT_WINDOW_DAYS = 30
VEGETATION_NDVI_THRESHOLD = 0.3
NDVI_VIS = {"min": 0, "max": 1, "palette": ["brown", "yellow", "green"]}


def build_polygon(points) -> ee.Geometry:
    return polygon([(point.longitude, point.latitude) for point in points])


def _no_data_result() -> dict:
    return {
        "recomendacao": [
            "Não foi possível calcular o NDVI para essa área e período. Tente outra área ou outro intervalo de datas."
        ],
        "interpretacao": [],
        "status": "Sem dados",
        "ndvi": None,
        "area_total_ha": None,
        "cobertura_vegetal_percentual": None,
        "tile_url": None,
    }


def _classify(ndvi_value: float) -> tuple[str, list[str], list[str]]:
    if ndvi_value < 0.3:
        return "Ruim", [
            "A vegetação apresenta desenvolvimento insuficiente.",
        ], [
            "Verificar irrigação e possíveis áreas mais secas.",
            "Possível exposição do solo, verifique a mata.",
            "Busque pela presença de pragas nas áreas amareladas e laranjas e, caso encontre, procure um técnico antes de aplicar defensivos.",
        ]
    if ndvi_value < 0.6:
        return "Médio", [
            "A vegetação apresenta desenvolvimento moderado.",
        ], [
            "Recomenda-se acompanhar a evolução do solo mais de perto nos próximos dias.",
            "Verifique possível presença de pragas.",
        ]
    if ndvi_value >= 0.8:
        return "Excelente", [
            "A vegetação apresenta um desenvolvimento incrível.",
            "Solo está verde e bem irrigado dentro do nível médio NDVI esperado.",
        ], [
            "Continuar o manejo atual, indicadores demonstram bom desempenho da cultura.",
            "Realizar inspeções preventivas para detecção antecipada de pragas e doenças.",
        ]
    return "Bom", [
        "A vegetação apresenta bom vigor vegetativo.",
        "Os índices indicam boa cobertura vegetal e atividade fotossintética adequada.",
        "A maior parte da lavoura encontra-se dentro dos padrões esperados de crescimento.",
    ], [
        "Monitorar possíveis alterações nos próximos ciclos para identificar quedas precoces de vigor.",
        "Manter as práticas de manejo adotadas, avaliando possíveis otimizações conforme a fase da cultura.",
        "Comparar os resultados com análises anteriores para identificar padrões de desenvolvimento.",
    ]


def calculate(points, start_date: date | None = None, end_date: date | None = None) -> dict:
    end = end_date or date.today()
    start = start_date or end - timedelta(days=DEFAULT_WINDOW_DAYS)
    area = build_polygon(points)

    collection = sentinel_collection(area, start, end).map(with_indices)
    # Median of the cloud-masked pixels over the period.
    ndvi = collection.select("ndvi").median().rename("NDVI")

    ndvi_value = (
        ndvi.reduceRegion(reducer=ee.Reducer.mean(), geometry=area, scale=PIXEL_SCALE_M, maxPixels=1e9)
        .get("NDVI")
        .getInfo()
    )
    if ndvi_value is None:
        return _no_data_result()
    ndvi_value = round(ndvi_value, 2)

    vegetated_m2 = (
        ndvi.gt(VEGETATION_NDVI_THRESHOLD)
        .multiply(ee.Image.pixelArea())
        .rename("area")
        .reduceRegion(reducer=ee.Reducer.sum(), geometry=area, scale=PIXEL_SCALE_M, maxPixels=1e9)
        .get("area")
    )
    area_total_ha = area.area(maxError=1).divide(10_000).getInfo()
    vegetated_ha = ee.Number(vegetated_m2).divide(10_000).getInfo() or 0
    coverage_pct = round(vegetated_ha / area_total_ha * 100, 1) if area_total_ha else 0.0

    status, interpretacao, recomendacao = _classify(ndvi_value)
    tile_url = ndvi.clip(area).getMapId(NDVI_VIS)["tile_fetcher"].url_format

    return {
        "recomendacao": recomendacao,
        "interpretacao": interpretacao,
        "status": status,
        "ndvi": ndvi_value,
        "area_total_ha": round(area_total_ha, 1),
        "cobertura_vegetal_percentual": coverage_pct,
        "tile_url": tile_url,
    }
