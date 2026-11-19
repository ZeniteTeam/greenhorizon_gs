import { Card } from '../../../components/Card';
import type { VisitPriority } from '../../../types/monitoring';
import { formatNumber } from '../../../utils/format';

export function VisitPriorityList({ visits }: { visits: VisitPriority[] }) {
  const ranked = [...visits].sort((a, b) => b.score - a.score);

  return (
    <Card padding={24} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="gh-eyebrow">Painel da cooperativa · Emater · prefeitura</span>
        <h2 className="text-lg font-semibold text-heading">Quem visitar primeiro</h2>
        <p className="text-sm text-body">
          Prioridade calculada pela distância de focos confirmados, perda de vigor e falta de assistência técnica.
        </p>
      </div>

      <ol className="flex flex-col divide-y divide-hairline">
        {ranked.map((visit, index) => (
          <li key={visit.id} className="grid grid-cols-[2rem_minmax(0,1fr)_5.5rem] items-center gap-4 py-3 sm:grid-cols-[2rem_minmax(0,1.2fr)_minmax(0,1.6fr)_5.5rem]">
            <span className="text-sm font-bold tabular-nums text-subtle">{index + 1}</span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-heading">{visit.producer}</span>
              <span className="truncate text-xs text-body">
                {visit.fieldName} · {visit.distanceKm > 0 ? `${formatNumber(visit.distanceKm, 1)} km` : 'você'}
              </span>
            </div>
            <span className="hidden text-sm leading-snug text-body sm:block">{visit.reason}</span>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-bold tabular-nums text-heading">{visit.score}</span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline" aria-hidden="true">
                <div className="h-full rounded-full bg-heading" style={{ width: `${visit.score}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default VisitPriorityList;
