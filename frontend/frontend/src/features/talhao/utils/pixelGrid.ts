import { changeColor, colors, moistureColor, NDVI_DISPLAY_RANGE, ndviColor } from '../../../styles/colors';
import type { LatLng, MapLayer, SatelliteSample } from '../../../types/monitoring';
import { bounds, contains } from '../../../utils/geo';
import { noise } from '../../../utils/noise';

export interface PixelCell {
  id: string;
  bounds: [LatLng, LatLng];
  fill: string;
  cloud: boolean;
}

const GRID_COLUMNS = 30;

function pick(sample: SatelliteSample, inZone: boolean, metric: 'ndvi' | 'ndmi'): number | null {
  if (metric === 'ndmi') return inZone ? sample.zoneNdmi ?? sample.fieldNdmi : sample.fieldNdmi;
  return inZone ? sample.zoneNdvi ?? sample.fieldNdvi : sample.fieldNdvi;
}

function cellColor(
  layer: MapLayer,
  sample: SatelliteSample,
  previous: SatelliteSample | undefined,
  inZone: boolean,
  variation: number,
): string | null {
  if (layer === 'ndmi') {
    const v = pick(sample, inZone, 'ndmi');
    return v === null ? null : moistureColor(v + variation * 0.5);
  }
  if (layer === 'change') {
    const now = pick(sample, inZone, 'ndvi');
    const before = previous ? pick(previous, inZone, 'ndvi') : null;
    return now === null || before === null ? null : changeColor(now - before + variation * 0.25);
  }
  const v = pick(sample, inZone, 'ndvi');
  return v === null ? null : ndviColor(v + variation, NDVI_DISPLAY_RANGE);
}

/**
 * Preview raster for a pass: each cell takes the field or zone value plus local
 * variation. In production this is replaced by the Earth Engine tile layer.
 */
export function buildPixelGrid(
  boundary: LatLng[],
  zone: LatLng[] | undefined,
  sample: SatelliteSample,
  layer: MapLayer,
  previous?: SatelliteSample,
): PixelCell[] {
  const [[south, west], [north, east]] = bounds(boundary);
  const cellLng = (east - west) / GRID_COLUMNS;
  const rows = Math.round(GRID_COLUMNS * ((north - south) / (east - west)));
  const cellLat = (north - south) / rows;
  const cells: PixelCell[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < GRID_COLUMNS; c++) {
      const center: LatLng = [south + (r + 0.5) * cellLat, west + (c + 0.5) * cellLng];
      if (!contains(boundary, center)) continue;

      const index = r * GRID_COLUMNS + c;
      const masked = (noise(sample.dap, index) + 1) / 2 < sample.cloudMasked;
      const inZone = zone ? contains(zone, center) : false;
      const variation = noise(17, index) * 0.035 + Math.sin(c / 4) * 0.012;
      const fill = masked ? null : cellColor(layer, sample, previous, inZone, variation);

      cells.push({
        id: `${r}-${c}`,
        bounds: [[south + r * cellLat, west + c * cellLng], [south + (r + 1) * cellLat, west + (c + 1) * cellLng]],
        fill: fill ?? colors.cloud,
        cloud: fill === null,
      });
    }
  }
  return cells;
}

/** The latest pass with a reading at least `days` before the given one. */
export function previousReading(samples: SatelliteSample[], index: number, days = 10): SatelliteSample | undefined {
  const target = samples[index].dap - days;
  for (let i = index - 1; i >= 0; i--) {
    if (samples[i].dap <= target && samples[i].fieldNdvi !== null) return samples[i];
  }
  return undefined;
}
