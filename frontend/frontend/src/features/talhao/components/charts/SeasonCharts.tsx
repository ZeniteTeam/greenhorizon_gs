import { useState, type PointerEvent } from 'react';
import { Table2 } from 'lucide-react';
import { Card } from '../../../../components/Card';
import { useElementWidth } from '../../../../hooks/useElementWidth';
import type { FieldDetail } from '../../../../types/monitoring';
import { dapFromX, makeXScale, nearestIndex } from '../../utils/chartLayout';
import { ChartLegend, type LegendItem } from './ChartLegend';
import { ChartTooltip } from './ChartTooltip';
import { NdviChart } from './NdviChart';
import { RainChart } from './RainChart';
import { SeasonTable } from './SeasonTable';

interface SeasonChartsProps {
  detail: FieldDetail;
  selectedIndex: number;
  onSelect: (index: number) => void;
  alertDap?: number;
}

const SNAP_TOLERANCE_DAYS = 4;

export function SeasonCharts({ detail, selectedIndex, onSelect, alertDap }: SeasonChartsProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const x = makeXScale(width, detail.seasonLengthDays);
  const daps = detail.samples.map((s) => s.dap);
  const hasZone = detail.zones.length > 0;
  const activeIndex = hoverIndex ?? (focused ? selectedIndex : null);
  const active = activeIndex === null ? null : detail.samples[activeIndex];

  function handlePointer(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const dap = dapFromX(event.clientX - rect.left, width, detail.seasonLengthDays);
    const lastDap = daps[daps.length - 1];
    if (dap < daps[0] - SNAP_TOLERANCE_DAYS || dap > lastDap + SNAP_TOLERANCE_DAYS) {
      setHoverIndex(null);
      return;
    }
    setHoverIndex(nearestIndex(daps, dap));
  }

  const ndviLegend: LegendItem[] = [
    { label: 'Talhão (média)', key: 'line', colorClass: 'bg-field' },
    ...(hasZone ? [{ label: 'Zona sob estresse', key: 'line' as const, colorClass: 'bg-zone' }] : []),
    { label: `Faixa esperada para ${detail.crop.toLowerCase()}`, key: 'band', colorClass: 'bg-brand/15' },
    { label: 'Passagem sem leitura (nuvens)', key: 'gap', colorClass: 'bg-cloud' },
  ];
  const rainLegend: LegendItem[] = [
    { label: 'Chuva no período (CHIRPS)', key: 'bar', colorClass: 'bg-rain' },
    { label: 'Média histórica', key: 'tick', colorClass: 'bg-heading' },
  ];

  return (
    <Card padding={24} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-heading">Vigor ao longo da safra</h2>
          <p className="text-sm text-body">
            Cada ponto é uma passagem do Sentinel-2, comparada com a curva esperada para a fase da cultura.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-brand hover:bg-tint"
          aria-pressed={showTable}
        >
          <Table2 size={16} aria-hidden="true" />
          {showTable ? 'Ver gráfico' : 'Ver tabela'}
        </button>
      </div>

      {showTable ? (
        <SeasonTable detail={detail} />
      ) : (
        <div ref={ref} className="relative flex flex-col gap-3">
          <ChartLegend items={ndviLegend} />
          <NdviChart
            detail={detail}
            width={width}
            x={x}
            activeIndex={activeIndex}
            selectedIndex={selectedIndex}
            alertDap={alertDap}
            onPointer={handlePointer}
            onLeave={() => setHoverIndex(null)}
            onSelect={onSelect}
            onFocusChange={setFocused}
          />
          <div className="mt-2 border-t border-hairline pt-4">
            <ChartLegend items={rainLegend} />
          </div>
          <RainChart
            rain={detail.rain}
            width={width}
            x={x}
            activeIndex={activeIndex}
            onPointer={handlePointer}
            onLeave={() => setHoverIndex(null)}
          />
          {active && activeIndex !== null && (
            <ChartTooltip
              sample={active}
              expected={detail.expected.find((p) => p.dap === active.dap)}
              rain={detail.rain[activeIndex]}
              hasZone={hasZone}
              x={x(active.dap)}
              containerWidth={width}
            />
          )}
        </div>
      )}
    </Card>
  );
}

export default SeasonCharts;
