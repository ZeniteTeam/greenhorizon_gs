import type { KeyboardEvent, PointerEvent } from 'react';
import type { FieldDetail } from '../../../../types/monitoring';
import { formatDayMonth, formatNumber } from '../../../../utils/format';
import { CHART_MARGIN, linePath, monthTicks, type XScale } from '../../utils/chartLayout';

export const NDVI_CHART_HEIGHT = 260;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];
/** Minimum vertical distance (px) between the two end labels so their text never overlaps. */
const END_LABEL_GAP = 16;

interface NdviChartProps {
  detail: FieldDetail;
  width: number;
  x: XScale;
  activeIndex: number | null;
  selectedIndex: number;
  alertDap?: number;
  onPointer: (event: PointerEvent<SVGSVGElement>) => void;
  onLeave: () => void;
  onSelect: (index: number) => void;
  onFocusChange: (focused: boolean) => void;
}

const y = (v: number) =>
  CHART_MARGIN.top + (1 - v) * (NDVI_CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom);

/** Text positions for the field and zone labels, pushed apart around their midpoint when too close. */
function spreadLabels(fieldY: number | null, zoneY: number | null) {
  if (fieldY === null || zoneY === null || Math.abs(fieldY - zoneY) >= END_LABEL_GAP) {
    return { fieldLabelY: fieldY, zoneLabelY: zoneY };
  }
  const mid = (fieldY + zoneY) / 2;
  const half = END_LABEL_GAP / 2;
  // The higher line (smaller y) keeps the upper slot; the field wins ties.
  const fieldOnTop = fieldY <= zoneY;
  return {
    fieldLabelY: fieldOnTop ? mid - half : mid + half,
    zoneLabelY: fieldOnTop ? mid + half : mid - half,
  };
}

function lastPoint(values: Array<{ dap: number; v: number | null }>) {
  for (let i = values.length - 1; i >= 0; i--) {
    const { dap, v } = values[i];
    if (v !== null) return { dap, v };
  }
  return null;
}

export function NdviChart({
  detail, width, x, activeIndex, selectedIndex, alertDap, onPointer, onLeave, onSelect, onFocusChange,
}: NdviChartProps) {
  const { samples, expected, todayDap, seasonLengthDays } = detail;
  const plotRight = width - CHART_MARGIN.right;
  const plotBottom = NDVI_CHART_HEIGHT - CHART_MARGIN.bottom;
  const hasZone = detail.zones.length > 0;

  const bandPath =
    expected.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.dap)},${y(p.high)}`).join(' ') +
    ' ' +
    [...expected].reverse().map((p) => `L${x(p.dap)},${y(p.low)}`).join(' ') +
    ' Z';

  const fieldPath = linePath(samples.map((s) => ({ x: x(s.dap), y: s.fieldNdvi === null ? null : y(s.fieldNdvi) })));
  const zonePath = linePath(samples.map((s) => ({ x: x(s.dap), y: s.zoneNdvi === null ? null : y(s.zoneNdvi) })));
  const fieldEnd = lastPoint(samples.map((s) => ({ dap: s.dap, v: s.fieldNdvi })));
  const zoneEnd = hasZone ? lastPoint(samples.map((s) => ({ dap: s.dap, v: s.zoneNdvi }))) : null;
  const { fieldLabelY, zoneLabelY } = spreadLabels(
    fieldEnd ? y(fieldEnd.v) : null,
    zoneEnd ? y(zoneEnd.v) : null,
  );
  const selected = samples[selectedIndex];
  const active = activeIndex === null ? null : samples[activeIndex];
  const focus = active ?? selected;

  function handleKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === 'ArrowLeft') onSelect(Math.max(0, selectedIndex - 1));
    else if (event.key === 'ArrowRight') onSelect(Math.min(samples.length - 1, selectedIndex + 1));
    else return;
    event.preventDefault();
  }

  return (
    <svg
      width={width}
      height={NDVI_CHART_HEIGHT}
      role="img"
      tabIndex={0}
      aria-label={`NDVI do ${detail.name} ao longo da safra comparado com a faixa esperada. Use as setas para navegar entre as passagens.`}
      className="block touch-none outline-none focus-visible:rounded-md"
      onPointerMove={onPointer}
      onPointerDown={onPointer}
      onPointerLeave={onLeave}
      onClick={() => activeIndex !== null && onSelect(activeIndex)}
      onKeyDown={handleKey}
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
    >
      {Y_TICKS.map((t) => (
        <g key={t}>
          <line x1={CHART_MARGIN.left} x2={plotRight} y1={y(t)} y2={y(t)} strokeWidth={1} className="stroke-hairline" />
          <text x={CHART_MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-subtle text-[11px] tabular-nums">
            {formatNumber(t)}
          </text>
        </g>
      ))}
      {monthTicks(detail.plantedAt, seasonLengthDays).map((m) => (
        <text key={m.label} x={x(m.dap)} y={NDVI_CHART_HEIGHT - 8} textAnchor="middle" className="fill-subtle text-[11px]">
          {m.label}
        </text>
      ))}

      <rect x={x(todayDap)} y={CHART_MARGIN.top} width={Math.max(0, plotRight - x(todayDap))} height={plotBottom - CHART_MARGIN.top} className="fill-page" />
      <text x={(x(todayDap) + plotRight) / 2} y={CHART_MARGIN.top + 14} textAnchor="middle" className="fill-subtle text-[11px]">
        próximas semanas
      </text>

      <path d={bandPath} className="fill-brand/10" />

      {samples.filter((s) => s.fieldNdvi === null).map((s) => (
        <rect key={s.dap} x={x(s.dap) - 3} width={6} y={CHART_MARGIN.top} height={plotBottom - CHART_MARGIN.top} rx={2} className="fill-cloud" />
      ))}

      {alertDap !== undefined && (
        <g>
          <line x1={x(alertDap)} x2={x(alertDap)} y1={CHART_MARGIN.top} y2={plotBottom} strokeWidth={1} className="stroke-zone" />
          <text x={x(alertDap) - 6} y={CHART_MARGIN.top - 6} textAnchor="end" className="fill-heading text-[11px] font-semibold">
            alerta {formatDayMonth(samples.find((s) => s.dap === alertDap)?.date ?? detail.today)}
          </text>
        </g>
      )}

      <path d={fieldPath} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="stroke-field" />
      {hasZone && (
        <path d={zonePath} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="stroke-zone" />
      )}

      <line x1={x(selected.dap)} x2={x(selected.dap)} y1={CHART_MARGIN.top} y2={plotBottom} strokeWidth={1} className="stroke-heading" />
      {active && (
        <line x1={x(active.dap)} x2={x(active.dap)} y1={CHART_MARGIN.top} y2={plotBottom} strokeWidth={1} className="stroke-subtle" />
      )}

      {focus.fieldNdvi !== null && (
        <circle cx={x(focus.dap)} cy={y(focus.fieldNdvi)} r={4} strokeWidth={2} className="fill-field stroke-card" />
      )}
      {hasZone && focus.zoneNdvi !== null && (
        <circle cx={x(focus.dap)} cy={y(focus.zoneNdvi)} r={4} strokeWidth={2} className="fill-zone stroke-card" />
      )}

      {fieldEnd && (
        <EndLabel
          x={x(fieldEnd.dap)} y={y(fieldEnd.v)} labelY={fieldLabelY ?? y(fieldEnd.v)}
          label="Talhão" value={fieldEnd.v} dotClass="fill-field"
        />
      )}
      {zoneEnd && (
        <EndLabel
          x={x(zoneEnd.dap)} y={y(zoneEnd.v)} labelY={zoneLabelY ?? y(zoneEnd.v)}
          label="Zona" value={zoneEnd.v} dotClass="fill-zone"
        />
      )}
    </svg>
  );
}

interface EndLabelProps {
  x: number;
  y: number;
  /** Vertical position of the text; differs from `y` when nudged away from the other label. */
  labelY: number;
  label: string;
  value: number;
  dotClass: string;
}

function EndLabel({ x, y, labelY, label, value, dotClass }: EndLabelProps) {
  return (
    <g>
      <circle cx={x} cy={y} r={4} strokeWidth={2} className={`${dotClass} stroke-card`} />
      <text x={x + 10} y={labelY} dy="0.32em" className="fill-heading text-xs">
        <tspan className="font-semibold">{formatNumber(value)}</tspan>
        <tspan className="fill-body"> {label}</tspan>
      </text>
    </g>
  );
}

export default NdviChart;
