"""Season monitoring for one field: per-pass vigor/moisture, rain vs normal and stress zones."""

from datetime import date, timedelta
from typing import Literal

import ee

from earth_engine import PIXEL_SCALE_M, daily_mosaic, polygon, sentinel_collection

LatLng = tuple[float, float]
Layer = Literal["ndvi", "ndmi", "change"]

# A pass is unreadable when fewer than 10% of the field's pixels are clear.
UNREADABLE_MASKED_SHARE = 0.9
# Passes used for zone detection must be at least 70% clear.
DETECTION_MAX_MASKED_SHARE = 0.3
# Detection compares the latest clear pass with one about 10 days earlier.
DETECTION_WINDOW_DAYS = 10
DETECTION_MIN_GAP_DAYS = 7
DETECTION_MAX_GAP_DAYS = 15
# A pixel is stressed when its NDVI fell at least this much between the two passes.
STRESS_NDVI_DROP = 0.10
# Patches smaller than 25 pixels (0.25 ha at 10 m) are treated as noise.
MIN_PATCH_PIXELS = 25
MIN_ZONE_AREA_M2 = MIN_PATCH_PIXELS * PIXEL_SCALE_M**2
MAX_ZONES = 3

CHIRPS = "UCSB-CHG/CHIRPS/DAILY"
CHIRPS_SCALE_M = 5566
RAIN_BIN_DAYS = 5
NORMAL_FIRST_YEAR = 1995
NORMAL_YEARS = 30

# Palettes match the legends in the frontend (src/index.css).
TILE_VIS: dict[Layer, dict] = {
    "ndvi": {"min": 0.2, "max": 0.9, "palette": ["e8442c", "f5912b", "f2d028", "9bd13f", "197b27"]},
    "ndmi": {"min": 0.0, "max": 0.45, "palette": ["eaf1fa", "7fa7d6", "1f4e8c"]},
    "change": {"min": -0.15, "max": 0.15, "palette": ["c2560c", "dedede", "2f6db5"]},
}


def _to_lng_lat(points: list[LatLng]) -> list[tuple[float, float]]:
    return [(lng, lat) for lat, lng in points]


def _area(points: list[LatLng]) -> ee.Geometry:
    return polygon(_to_lng_lat(points))


def _round(value: float | None, digits: int = 3) -> float | None:
    return None if value is None else round(value, digits)


# --------------------------------------------------------------------------- passes


def _pass_dates(collection: ee.ImageCollection) -> list[str]:
    dates = (
        collection.aggregate_array("system:time_start")
        .map(lambda t: ee.Date(t).format("YYYY-MM-dd"))
        .distinct()
        .getInfo()
    )
    return sorted(dates)


def _series(collection: ee.ImageCollection, area: ee.Geometry, dates: list[str]) -> dict[str, dict]:
    """Mean NDVI, NDMI and clear-pixel share inside the area, for every pass date."""

    def per_pass(day):
        image = daily_mosaic(collection, ee.Date(day))
        stats = image.select(["ndvi", "ndmi", "clear"]).reduceRegion(
            reducer=ee.Reducer.mean(), geometry=area, scale=PIXEL_SCALE_M, maxPixels=1e9
        )
        return ee.Feature(None, stats).set("date", day)

    features = ee.FeatureCollection(ee.List(dates).map(per_pass)).getInfo()["features"]
    return {f["properties"]["date"]: f["properties"] for f in features}


def _sample(day: str, field: dict, zone: dict | None) -> dict:
    clear = field.get("clear")
    masked = 1.0 if clear is None else 1 - clear
    readable = masked < UNREADABLE_MASKED_SHARE
    zone = zone or {}
    return {
        "date": day,
        "fieldNdvi": _round(field.get("ndvi")) if readable else None,
        "fieldNdmi": _round(field.get("ndmi")) if readable else None,
        "zoneNdvi": _round(zone.get("ndvi")) if readable else None,
        "zoneNdmi": _round(zone.get("ndmi")) if readable else None,
        "cloudMasked": _round(masked),
    }


# --------------------------------------------------------------------------- zones


def _detection_pair(samples: list[dict]) -> tuple[dict, dict] | None:
    clear = [s for s in samples if s["fieldNdvi"] is not None and s["cloudMasked"] <= DETECTION_MAX_MASKED_SHARE]
    if len(clear) < 2:
        return None
    after = clear[-1]
    after_day = date.fromisoformat(after["date"])
    candidates = [
        s
        for s in clear[:-1]
        if DETECTION_MIN_GAP_DAYS <= (after_day - date.fromisoformat(s["date"])).days <= DETECTION_MAX_GAP_DAYS
    ]
    if not candidates:
        return None
    before = min(
        candidates,
        key=lambda s: abs((after_day - date.fromisoformat(s["date"])).days - DETECTION_WINDOW_DAYS),
    )
    return before, after


def _outer_ring(geometry: dict) -> list[LatLng]:
    coordinates = geometry["coordinates"]
    if geometry["type"] == "MultiPolygon":
        coordinates = max(coordinates, key=lambda poly: len(poly[0]))
    return [(lat, lng) for lng, lat in coordinates[0]]


def _detect_zones(collection: ee.ImageCollection, area: ee.Geometry, before_day: str, after_day: str) -> list[dict]:
    before = daily_mosaic(collection, ee.Date(before_day))
    after = daily_mosaic(collection, ee.Date(after_day))
    change = after.select("ndvi").subtract(before.select("ndvi")).rename("change")

    stressed = change.lte(-STRESS_NDVI_DROP).selfMask()
    patch_size = stressed.connectedPixelCount(maxSize=128, eightConnected=True)
    stressed = stressed.updateMask(patch_size.gte(MIN_PATCH_PIXELS)).toInt().clip(area)

    vectors = (
        stressed.reduceToVectors(
            geometry=area,
            scale=PIXEL_SCALE_M,
            geometryType="polygon",
            eightConnected=True,
            labelProperty="stressed",
            maxPixels=1e9,
        )
        .map(lambda f: f.set("area_m2", f.geometry().area(1)))
        .filter(ee.Filter.gte("area_m2", MIN_ZONE_AREA_M2))
        .sort("area_m2", False)
        .limit(MAX_ZONES)
    )

    stack = ee.Image.cat(
        [
            before.select(["ndvi", "ndmi"]).rename(["ndviBefore", "ndmiBefore"]),
            after.select(["ndvi", "ndmi"]).rename(["ndviAfter", "ndmiAfter"]),
        ]
    )
    worst = change.addBands(ee.Image.pixelLonLat())

    def describe(feature):
        geometry = feature.geometry()
        means = stack.reduceRegion(ee.Reducer.mean(), geometry, PIXEL_SCALE_M, maxPixels=1e9)
        # Scout point: the pixel with the biggest vigor drop inside the zone.
        lowest = worst.reduceRegion(
            ee.Reducer.min(3).setOutputs(["change", "lon", "lat"]), geometry, PIXEL_SCALE_M, maxPixels=1e9
        )
        centroid = geometry.centroid(1).coordinates()
        return (
            ee.Feature(geometry.simplify(PIXEL_SCALE_M / 2))
            .set(means)
            .set("areaM2", feature.get("area_m2"))
            .set("scoutLon", ee.Algorithms.If(lowest.get("lon"), lowest.get("lon"), centroid.get(0)))
            .set("scoutLat", ee.Algorithms.If(lowest.get("lat"), lowest.get("lat"), centroid.get(1)))
        )

    zones = []
    for feature in vectors.map(describe).getInfo()["features"]:
        p = feature["properties"]
        zones.append(
            {
                "polygon": _outer_ring(feature["geometry"]),
                "areaHa": round(p["areaM2"] / 10_000, 2),
                "ndviBefore": _round(p.get("ndviBefore")),
                "ndviAfter": _round(p.get("ndviAfter")),
                "ndmiBefore": _round(p.get("ndmiBefore")),
                "ndmiAfter": _round(p.get("ndmiAfter")),
                "scoutPoint": (p["scoutLat"], p["scoutLon"]),
            }
        )
    return zones


# --------------------------------------------------------------------------- rain


def _rain(area: ee.Geometry, planted_at: date, until: date) -> list[dict]:
    """CHIRPS rain in 5-day bins since planting, with the 30-year normal for the same bins.

    `mm` is None when CHIRPS has not published the whole bin yet (it lags a few weeks).
    """
    bin_ends = []
    end = planted_at + timedelta(days=RAIN_BIN_DAYS)
    while end <= until:
        bin_ends.append(end.isoformat())
        end += timedelta(days=RAIN_BIN_DAYS)
    if not bin_ends:
        return []

    point = area.centroid(1)
    chirps = ee.ImageCollection(CHIRPS).select("precipitation")
    history = chirps.filterDate(f"{NORMAL_FIRST_YEAR}-01-01", f"{NORMAL_FIRST_YEAR + NORMAL_YEARS}-01-01")

    no_data = ee.Image.constant(0).rename("precipitation").updateMask(0)

    def total(images: ee.ImageCollection):
        summed = ee.Image(ee.Algorithms.If(images.size().gt(0), images.sum(), no_data))
        return summed.reduceRegion(ee.Reducer.mean(), point, CHIRPS_SCALE_M).get("precipitation")

    def per_bin(day):
        last = ee.Date(day)
        first = last.advance(-(RAIN_BIN_DAYS - 1), "day")
        season_images = chirps.filterDate(first, last.advance(1, "day"))
        normal_images = history.filter(
            ee.Filter.calendarRange(first.getRelative("day", "year").add(1), last.getRelative("day", "year").add(1), "day_of_year")
        )
        return ee.Feature(
            None,
            {
                "date": day,
                "days": season_images.size(),
                "mm": total(season_images),
                "normal": ee.Number(total(normal_images)).divide(NORMAL_YEARS),
            },
        )

    features = ee.FeatureCollection(ee.List(bin_ends).map(per_bin)).getInfo()["features"]
    rain = []
    for f in features:
        p = f["properties"]
        complete = p.get("days") == RAIN_BIN_DAYS and p.get("mm") is not None
        rain.append(
            {
                "date": p["date"],
                "mm": round(p["mm"], 1) if complete else None,
                "normalMm": round(p.get("normal") or 0, 1),
            }
        )
    return sorted(rain, key=lambda r: r["date"])


# --------------------------------------------------------------------------- public


def analyze_field(
    boundary: list[LatLng],
    planted_at: date,
    until: date,
    focus_zone: list[LatLng] | None = None,
) -> dict:
    """Whole-season analysis of a field.

    `focus_zone` is the zone already being followed (its NDVI/NDMI series is returned);
    when absent, the largest newly detected zone is followed instead.
    """
    area = _area(boundary)
    collection = sentinel_collection(area, planted_at, until)
    dates = _pass_dates(collection)

    field_series = _series(collection, area, dates) if dates else {}
    samples = [_sample(d, field_series[d], None) for d in dates if d in field_series]

    detection = None
    pair = _detection_pair(samples)
    if pair:
        before, after = pair
        zones = _detect_zones(collection, area, before["date"], after["date"])
        detection = {
            "beforeDate": before["date"],
            "afterDate": after["date"],
            "fieldNdviBefore": before["fieldNdvi"],
            "fieldNdviAfter": after["fieldNdvi"],
            "zones": zones,
        }
        if focus_zone is None and zones:
            focus_zone = zones[0]["polygon"]

    if focus_zone and dates:
        zone_series = _series(collection, _area(focus_zone), dates)
        samples = [_sample(d, field_series[d], zone_series.get(d)) for d in dates if d in field_series]

    return {
        "samples": samples,
        "rain": _rain(area, planted_at, until),
        "detection": detection,
    }


def tile_url(boundary: list[LatLng], day: date, layer: Layer, previous_day: date | None = None) -> str:
    """Map tile URL for one pass and layer. Earth Engine URLs expire after a few hours."""
    area = _area(boundary)
    collection = sentinel_collection(area, min(day, previous_day or day), day)
    image = daily_mosaic(collection, ee.Date(day.isoformat()))

    if layer == "change":
        if previous_day is None:
            raise ValueError("A camada de mudança precisa da data da passagem anterior.")
        before = daily_mosaic(collection, ee.Date(previous_day.isoformat()))
        band = image.select("ndvi").subtract(before.select("ndvi"))
    else:
        band = image.select(layer)

    return band.clip(area).getMapId(TILE_VIS[layer])["tile_fetcher"].url_format
