import { addDays } from '../../../utils/format';

export const CHART_MARGIN = { top: 20, right: 104, bottom: 28, left: 44 } as const;

export type XScale = (dap: number) => number;

export function makeXScale(width: number, seasonLengthDays: number): XScale {
  const inner = Math.max(1, width - CHART_MARGIN.left - CHART_MARGIN.right);
  return (dap) => CHART_MARGIN.left + (dap / seasonLengthDays) * inner;
}

export function dapFromX(x: number, width: number, seasonLengthDays: number): number {
  const inner = Math.max(1, width - CHART_MARGIN.left - CHART_MARGIN.right);
  return ((x - CHART_MARGIN.left) / inner) * seasonLengthDays;
}

export function nearestIndex(daps: number[], dap: number): number {
  let best = 0;
  daps.forEach((d, i) => {
    if (Math.abs(d - dap) < Math.abs(daps[best] - dap)) best = i;
  });
  return best;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** First day of each month that falls inside the season, positioned by days after planting. */
export function monthTicks(plantedAt: string, seasonLengthDays: number): Array<{ dap: number; label: string }> {
  const ticks: Array<{ dap: number; label: string }> = [];
  for (let dap = 1; dap <= seasonLengthDays; dap++) {
    const iso = addDays(plantedAt, dap);
    if (iso.endsWith('-01')) ticks.push({ dap, label: MONTHS[Number(iso.slice(5, 7)) - 1] });
  }
  return ticks;
}

/** Splits a series at null values so cloud gaps render as breaks in the line. */
export function linePath(points: Array<{ x: number; y: number | null }>): string {
  let path = '';
  let penDown = false;
  for (const { x, y } of points) {
    if (y === null) {
      penDown = false;
      continue;
    }
    path += `${penDown ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
    penDown = true;
  }
  return path.trim();
}
