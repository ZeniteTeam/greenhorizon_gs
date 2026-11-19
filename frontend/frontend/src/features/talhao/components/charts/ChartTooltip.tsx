import type { ExpectedPoint, RainSample, SatelliteSample } from '../../../../types/monitoring';
import { formatDayMonth, formatNumber, formatPercent } from '../../../../utils/format';

interface ChartTooltipProps {
  sample: SatelliteSample;
  expected?: ExpectedPoint;
  rain?: RainSample;
  hasZone: boolean;
  x: number;
  containerWidth: number;
}

const TOOLTIP_WIDTH = 232;
const OFFSET = 14;

function Row({ keyClass, value, label }: { keyClass: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-0.5 w-3 flex-shrink-0 rounded-full ${keyClass}`} aria-hidden="true" />
      <span className="font-semibold tabular-nums text-heading">{value}</span>
      <span className="truncate text-body">{label}</span>
    </div>
  );
}

export function ChartTooltip({ sample, expected, rain, hasZone, x, containerWidth }: ChartTooltipProps) {
  const fitsRight = x + OFFSET + TOOLTIP_WIDTH < containerWidth;
  const left = fitsRight ? x + OFFSET : x - OFFSET - TOOLTIP_WIDTH;

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute top-2 z-10 flex flex-col gap-1.5 rounded-md bg-card p-3 text-xs shadow-soft ring-1 ring-hairline"
      style={{ left: Math.max(0, left), width: TOOLTIP_WIDTH }}
    >
      <div className="flex flex-col">
        <span className="font-semibold text-heading">
          {formatDayMonth(sample.date)} · {sample.dap} dias
        </span>
        <span className="text-subtle">{sample.stage}</span>
      </div>

      {sample.fieldNdvi === null ? (
        <span className="text-body">Cena coberta por nuvens: sem leitura nesta passagem.</span>
      ) : (
        <>
          <Row keyClass="bg-field" value={formatNumber(sample.fieldNdvi)} label="Talhão (média)" />
          {hasZone && sample.zoneNdvi !== null && (
            <Row keyClass="bg-zone" value={formatNumber(sample.zoneNdvi)} label="Zona sob estresse" />
          )}
        </>
      )}
      {expected && (
        <Row
          keyClass="bg-brand/30"
          value={`${formatNumber(expected.low)}–${formatNumber(expected.high)}`}
          label="Faixa esperada"
        />
      )}
      {rain && (
        <Row keyClass="bg-rain" value={`${rain.mm} mm`} label={`Chuva (média ${rain.normalMm} mm)`} />
      )}
      {sample.cloudMasked >= 0.05 && sample.fieldNdvi !== null && (
        <span className="text-subtle">{formatPercent(sample.cloudMasked * 100)} dos pixels mascarados por nuvem</span>
      )}
    </div>
  );
}

export default ChartTooltip;
