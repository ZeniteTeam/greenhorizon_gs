"""Earth Engine session and shared Sentinel-2 helpers."""

from datetime import date, timedelta

import ee

from settings import get_settings

SENTINEL_2 = "COPERNICUS/S2_SR_HARMONIZED"
# Scenes are pre-filtered loosely; clouds are removed pixel by pixel afterwards.
MAX_SCENE_CLOUD_PERCENT = 80
# Sentinel-2 Scene Classification (SCL) classes that are not usable ground:
# 0 no data, 1 saturated, 3 cloud shadow, 8/9 cloud, 10 cirrus, 11 snow.
UNUSABLE_SCL_CLASSES = [0, 1, 3, 8, 9, 10, 11]
PIXEL_SCALE_M = 10

_initialized = False


def initialize() -> None:
    """Opens the Earth Engine session once per process (not per request)."""
    global _initialized
    if _initialized:
        return

    settings = get_settings()
    if settings.ee_service_account_key:
        credentials = ee.ServiceAccountCredentials(None, key_file=settings.ee_service_account_key)
        ee.Initialize(credentials, project=settings.ee_project)
    else:
        ee.Initialize(project=settings.ee_project)
    _initialized = True


def polygon(points: list[tuple[float, float]]) -> ee.Geometry:
    """Builds a closed polygon from (longitude, latitude) pairs."""
    if len(points) < 3:
        raise ValueError("É necessário informar pelo menos 3 pontos para formar uma área.")
    ring = [list(p) for p in points]
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    return ee.Geometry.Polygon([ring])


def clear_mask(image: ee.Image) -> ee.Image:
    """1 where the pixel shows usable ground, 0 for cloud, shadow, cirrus, snow or no data."""
    scl = image.select("SCL")
    return scl.remap(UNUSABLE_SCL_CLASSES, [0] * len(UNUSABLE_SCL_CLASSES), 1).rename("clear")


def with_indices(image: ee.Image) -> ee.Image:
    """Adds cloud-masked NDVI and NDMI bands plus the clear-pixel band."""
    clear = clear_mask(image)
    ndvi = image.normalizedDifference(["B8", "B4"]).rename("ndvi").updateMask(clear)
    ndmi = image.normalizedDifference(["B8", "B11"]).rename("ndmi").updateMask(clear)
    return image.addBands([ndvi, ndmi, clear])


def sentinel_collection(area: ee.Geometry, start: date, end: date) -> ee.ImageCollection:
    """Sentinel-2 scenes over the area between start and end (inclusive)."""
    return (
        ee.ImageCollection(SENTINEL_2)
        .filterBounds(area)
        .filterDate(start.isoformat(), (end + timedelta(days=1)).isoformat())
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", MAX_SCENE_CLOUD_PERCENT))
    )


def daily_mosaic(collection: ee.ImageCollection, day: ee.Date) -> ee.Image:
    """Merges the tiles of one satellite pass (same day) into a single image."""
    return with_indices(collection.filterDate(day, day.advance(1, "day")).mosaic()).set(
        "date", day.format("YYYY-MM-dd")
    )
