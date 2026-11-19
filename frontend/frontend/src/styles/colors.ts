// Mirrors the tokens in index.css for places that cannot read CSS variables
// (Leaflet path options, computed fills).
export const colors = {
  brand: '#197b27',
  zone: '#b8329a',
  alert: '#c9341d',
  warn: '#b45f06',
  dark: '#032318',
  white: '#ffffff',
  cloud: '#d9dde3',
  suspected: '#b45f06',
} as const;

type Rgb = [number, number, number];
type Ramp = ReadonlyArray<[number, Rgb]>;

export const NDVI_STOPS: Ramp = [
  [0.0, [232, 68, 44]],
  [0.25, [245, 145, 43]],
  [0.5, [242, 208, 40]],
  [0.75, [155, 209, 63]],
  [1.0, [25, 123, 39]],
];

/** Sequential, single hue: dry (light) → moist (dark blue). */
const MOISTURE_STOPS: Ramp = [
  [0.0, [234, 241, 250]],
  [0.5, [127, 167, 214]],
  [1.0, [31, 78, 140]],
];

/** Diverging: loss (orange) → no change (gray) → gain (blue). */
const CHANGE_STOPS: Ramp = [
  [0.0, [194, 86, 12]],
  [0.5, [222, 222, 222]],
  [1.0, [47, 109, 181]],
];

/** Display stretch used on crop maps: values outside the range clamp to the ends. */
export const NDVI_DISPLAY_RANGE: [number, number] = [0.2, 0.9];
export const NDMI_DISPLAY_RANGE: [number, number] = [0.0, 0.45];
export const CHANGE_DISPLAY_RANGE: [number, number] = [-0.15, 0.15];

function sample(ramp: Ramp, value: number, [min, max]: [number, number]): string {
  const v = Math.max(0, Math.min(1, (value - min) / (max - min)));
  for (let i = 1; i < ramp.length; i++) {
    const [hiAt, hi] = ramp[i];
    const [loAt, lo] = ramp[i - 1];
    if (v <= hiAt) {
      const t = (v - loAt) / (hiAt - loAt);
      const mix = lo.map((c, k) => Math.round(c + (hi[k] - c) * t));
      return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
    }
  }
  return `rgb(${ramp[ramp.length - 1][1].join(', ')})`;
}

export function ndviColor(value: number, range: [number, number] = [0, 1]): string {
  return sample(NDVI_STOPS, value, range);
}

export function moistureColor(value: number): string {
  return sample(MOISTURE_STOPS, value, NDMI_DISPLAY_RANGE);
}

export function changeColor(delta: number): string {
  return sample(CHANGE_STOPS, delta, CHANGE_DISPLAY_RANGE);
}
