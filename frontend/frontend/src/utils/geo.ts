import * as turf from '@turf/turf';
import type { LatLng } from '../types/monitoring';

const METERS_PER_DEG_LAT = 110_574;

export function offsetMeters([lat, lng]: LatLng, north: number, east: number): LatLng {
  const metersPerDegLng = 111_320 * Math.cos((lat * Math.PI) / 180);
  return [lat + north / METERS_PER_DEG_LAT, lng + east / metersPerDegLng];
}

function toTurfPolygon(ring: LatLng[]) {
  const coords = ring.map(([lat, lng]) => [lng, lat]);
  return turf.polygon([[...coords, coords[0]]]);
}

export function areaHa(ring: LatLng[]): number {
  return turf.area(toTurfPolygon(ring)) / 10_000;
}

export function centroid(ring: LatLng[]): LatLng {
  const [lng, lat] = turf.centroid(toTurfPolygon(ring)).geometry.coordinates;
  return [lat, lng];
}

export function contains(ring: LatLng[], [lat, lng]: LatLng): boolean {
  return turf.booleanPointInPolygon(turf.point([lng, lat]), toTurfPolygon(ring));
}

export function distanceKm([aLat, aLng]: LatLng, [bLat, bLng]: LatLng): number {
  return turf.distance(turf.point([aLng, aLat]), turf.point([bLng, bLat]), { units: 'kilometers' });
}

const DIRECTIONS = [
  'ao norte', 'a nordeste', 'a leste', 'a sudeste',
  'ao sul', 'a sudoeste', 'a oeste', 'a noroeste',
] as const;

export function directionPhrase([aLat, aLng]: LatLng, [bLat, bLng]: LatLng): string {
  const bearing = turf.bearing(turf.point([aLng, aLat]), turf.point([bLng, bLat]));
  const index = Math.round(((bearing + 360) % 360) / 45) % 8;
  return DIRECTIONS[index];
}

export function bounds(ring: LatLng[]): [LatLng, LatLng] {
  const lats = ring.map((p) => p[0]);
  const lngs = ring.map((p) => p[1]);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}
