import { Card } from '../../../components/Card';
import type { ExpectedPoint, SatelliteSample } from '../../../types/monitoring';
import { formatDayMonth, formatNumber, formatPercent } from '../../../utils/format';

interface PassReadingsProps {
  sample: SatelliteSample;
  expected?: ExpectedPoint;
}

export function PassReadings({ sample, expected }: PassReadingsProps) {
  const readings = [
    { label: 'NDVI do talhão', value: sample.fieldNdvi === null ? '—' : formatNumber(sample.fieldNdvi) },
    { label: 'Faixa esperada', value: expected ? `${formatNumber(expected.low)}–${formatNumber(expected.high)}` : '—' },
    { label: 'Umidade (NDMI)', value: sample.fieldNdmi === null ? '—' : formatNumber(sample.fieldNdmi) },
    { label: 'Pixels com nuvem', value: formatPercent(sample.cloudMasked * 100) },
  ];

  return (
    <Card padding={24} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="gh-eyebrow">Passagem de {formatDayMonth(sample.date)}</span>
        <h2 className="text-lg font-semibold text-heading">{sample.stage}</h2>
      </div>
      <dl className="grid grid-cols-2 gap-4">
        {readings.map((r) => (
          <div key={r.label} className="flex flex-col gap-1">
            <dt className="text-xs text-body">{r.label}</dt>
            <dd className="text-xl font-bold text-heading">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default PassReadings;
