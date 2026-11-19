import type { CropName, ExpectedPoint, RainSample, SatelliteSample } from '../types/monitoring';
import { addDays } from '../utils/format';
import { noise } from '../utils/noise';

interface CropCurve {
  base: number;
  peak: number;
  riseMid: number;
  riseRate: number;
  senescenceStart: number;
  senescenceRate: number;
  band: number;
  seasonLengthDays: number;
  stages: ReadonlyArray<[number, string]>;
}

export const CROP_CURVES: Record<CropName, CropCurve> = {
  Soja: {
    base: 0.18, peak: 0.86, riseMid: 33, riseRate: 7,
    senescenceStart: 95, senescenceRate: 0.02, band: 0.07, seasonLengthDays: 120,
    stages: [
      [10, 'VE · emergência'], [20, 'V2 · 2º trifólio'], [30, 'V4 · 4º trifólio'],
      [40, 'V6 · vegetativo'], [50, 'R1 · início da floração'], [58, 'R2 · floração plena'],
      [72, 'R3 · início das vagens'], [85, 'R4 · vagem completa'], [98, 'R5 · enchimento de grãos'],
      [108, 'R6 · grão cheio'], [999, 'R7 · maturação'],
    ],
  },
  Milho: {
    base: 0.2, peak: 0.82, riseMid: 30, riseRate: 6,
    senescenceStart: 85, senescenceRate: 0.022, band: 0.07, seasonLengthDays: 125,
    stages: [
      [10, 'VE · emergência'], [25, 'V4 · 4 folhas'], [40, 'V8 · 8 folhas'],
      [55, 'V12 · 12 folhas'], [65, 'VT · pendoamento'], [75, 'R1 · embonecamento'],
      [90, 'R3 · grão leitoso'], [105, 'R5 · grão farináceo'], [999, 'R6 · maturação'],
    ],
  },
  Arroz: {
    base: 0.22, peak: 0.84, riseMid: 35, riseRate: 7,
    senescenceStart: 95, senescenceRate: 0.02, band: 0.07, seasonLengthDays: 120,
    stages: [
      [15, 'V1 · emergência'], [45, 'V6 · perfilhamento'], [70, 'R2 · emborrachamento'],
      [85, 'R4 · floração'], [100, 'R6 · enchimento'], [999, 'R9 · maturação'],
    ],
  },
};

export function expectedMid(curve: CropCurve, dap: number): number {
  const rise = (d: number) =>
    curve.base + (curve.peak - curve.base) / (1 + Math.exp(-(d - curve.riseMid) / curve.riseRate));
  if (dap <= curve.senescenceStart) return rise(dap);
  return rise(curve.senescenceStart) - curve.senescenceRate * (dap - curve.senescenceStart);
}

export function stageAt(curve: CropCurve, dap: number): string {
  return curve.stages.find(([until]) => dap <= until)?.[1] ?? curve.stages[curve.stages.length - 1][1];
}

export interface StressScenario {
  startDap: number;
  detectDap: number;
  dropAtDetect: number;
  fieldShare: number;
}

export interface SeasonConfig {
  crop: CropName;
  plantedAt: string;
  todayDap: number;
  seed: number;
  /** Systematic offset from the expected curve (e.g. -0.05 for a weaker field). */
  bias?: number;
  cloudyPasses?: Record<number, number>;
  stress?: StressScenario;
}

const REVISIT_DAYS = 5;

function normalRainMm(iso: string): number {
  const month = Number(iso.slice(5, 7));
  const byMonth: Record<number, number> = { 9: 12, 10: 22, 11: 38, 12: 48, 1: 50, 2: 46, 3: 38 };
  return byMonth[month] ?? 20;
}

export interface Season {
  samples: SatelliteSample[];
  expected: ExpectedPoint[];
  rain: RainSample[];
  seasonLengthDays: number;
}

export function buildSeason(config: SeasonConfig): Season {
  const curve = CROP_CURVES[config.crop];
  const bias = config.bias ?? 0;

  const zoneFactor = (dap: number) => {
    const s = config.stress;
    if (!s || dap <= s.startDap) return 1;
    const progress = (dap - s.startDap) / (s.detectDap - s.startDap);
    return 1 - s.dropAtDetect * progress;
  };

  const samples: SatelliteSample[] = [];
  for (let dap = REVISIT_DAYS; dap <= config.todayDap; dap += REVISIT_DAYS) {
    const i = dap / REVISIT_DAYS;
    const masked = config.cloudyPasses?.[dap] ?? Math.max(0, noise(config.seed + 7, i)) * 0.12;
    const healthy = expectedMid(curve, dap) + bias + noise(config.seed, i) * 0.018;
    const zone = healthy * zoneFactor(dap);
    const share = config.stress?.fieldShare ?? 0;
    const field = healthy * (1 - share) + zone * share;
    const fieldNdmi = 0.04 + 0.32 * ((healthy - curve.base) / (curve.peak - curve.base));
    const visible = masked < 0.9;
    const hasZone = Boolean(config.stress) && dap >= 40;

    samples.push({
      date: addDays(config.plantedAt, dap),
      dap,
      stage: stageAt(curve, dap),
      fieldNdvi: visible ? round(field) : null,
      zoneNdvi: visible && hasZone ? round(zone) : null,
      fieldNdmi: visible ? round(fieldNdmi) : null,
      zoneNdmi: visible && hasZone ? round(fieldNdmi * (1 - (1 - zoneFactor(dap)) * 0.12)) : null,
      cloudMasked: round(masked),
    });
  }

  const expected: ExpectedPoint[] = [];
  for (let dap = 0; dap <= curve.seasonLengthDays; dap += REVISIT_DAYS) {
    const mid = expectedMid(curve, dap);
    expected.push({ dap, low: round(mid - curve.band), high: round(Math.min(0.95, mid + curve.band)) });
  }

  const rain: RainSample[] = samples.map((s, i) => {
    const normal = normalRainMm(s.date);
    return {
      date: s.date,
      dap: s.dap,
      mm: Math.round(normal * (1 + noise(config.seed + 13, i) * 0.35)),
      normalMm: normal,
    };
  });

  return { samples, expected, rain, seasonLengthDays: curve.seasonLengthDays };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
