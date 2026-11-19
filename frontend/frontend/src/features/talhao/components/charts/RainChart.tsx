import type { PointerEvent } from 'react';
import type { RainSample } from '../../../../types/monitoring';
import { CHART_MARGIN, type XScale } from '../../utils/chartLayout';

const HEIGHT = 120;
const TOP = 10;
const BOTTOM = 22;
const MAX_BAR_WIDTH = 14;
const TICK_STEP_MM = 25;

interface RainChartProps {
  rain: RainSample[];
  width: number;
  x: XScale;
  activeIndex: number | null;
  onPointer: (event: PointerEvent<SVGSVGElement>) => void;
  onLeave: () => void;
}

function columnPath(cx: number, base: number, top: number, w: number): string {
  const r = Math.min(4, base - top, w / 2);
  const l = cx - w / 2;
  const rt = cx + w / 2;
  return `M${l},${base} V${top + r} Q${l},${top} ${l + r},${top} H${rt - r} Q${rt},${top} ${rt},${top + r} V${base} Z`;
}

export function RainChart({ rain, width, x, activeIndex, onPointer, onLeave }: RainChartProps) {
  const max = Math.ceil(Math.max(...rain.map((r) => Math.max(r.mm, r.normalMm))) / TICK_STEP_MM) * TICK_STEP_MM;
  const base = HEIGHT - BOTTOM;
  const y = (mm: number) => TOP + (1 - mm / max) * (base - TOP);
  const ticks = Array.from({ length: max / TICK_STEP_MM + 1 }, (_, i) => i * TICK_STEP_MM);
  const slot = rain.length > 1 ? x(rain[1].dap) - x(rain[0].dap) : MAX_BAR_WIDTH;
  const barWidth = Math.max(4, Math.min(MAX_BAR_WIDTH, slot - 4));
  const plotRight = width - CHART_MARGIN.right;

  return (
    <svg
      width={width}
      height={HEIGHT}
      role="img"
      aria-label="Chuva a cada passagem do satélite comparada com a média histórica"
      className="block touch-none"
      onPointerMove={onPointer}
      onPointerDown={onPointer}
      onPointerLeave={onLeave}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={CHART_MARGIN.left} x2={plotRight} y1={y(t)} y2={y(t)} strokeWidth={1} className="stroke-hairline" />
          <text x={CHART_MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-subtle text-[11px] tabular-nums">
            {t}
          </text>
        </g>
      ))}
      <text x={CHART_MARGIN.left - 8} y={HEIGHT - 6} textAnchor="end" className="fill-subtle text-[11px]">
        mm
      </text>

      {rain.map((r, i) => {
        const cx = x(r.dap);
        const dimmed = activeIndex !== null && activeIndex !== i;
        return (
          <g key={r.dap} opacity={dimmed ? 0.45 : 1}>
            {r.mm > 0 && <path d={columnPath(cx, base, y(r.mm), barWidth)} className="fill-rain" />}
            <line
              x1={cx - barWidth / 2 - 3}
              x2={cx + barWidth / 2 + 3}
              y1={y(r.normalMm)}
              y2={y(r.normalMm)}
              strokeWidth={2}
              strokeLinecap="round"
              className="stroke-heading"
            />
          </g>
        );
      })}

      {activeIndex !== null && rain[activeIndex] && (
        <line
          x1={x(rain[activeIndex].dap)}
          x2={x(rain[activeIndex].dap)}
          y1={TOP}
          y2={base}
          strokeWidth={1}
          className="pointer-events-none stroke-subtle"
        />
      )}
    </svg>
  );
}

export default RainChart;
