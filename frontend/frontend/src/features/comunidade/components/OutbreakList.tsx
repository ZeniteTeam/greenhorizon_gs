import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import type { Outbreak } from '../../../types/monitoring';
import { formatDayMonth, formatNumber } from '../../../utils/format';

export function OutbreakList({ outbreaks }: { outbreaks: Outbreak[] }) {
  return (
    <Card padding={24} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-heading">Ocorrências</h2>
      {outbreaks.length === 0 ? (
        <p className="text-sm text-body">Nenhuma ocorrência com esses filtros.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-subtle">
              <tr>
                <th scope="col" className="py-2 pr-4 font-semibold">Ocorrência</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Situação</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Local</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Distância</th>
                <th scope="col" className="py-2 text-right font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {outbreaks.map((o) => (
                <tr key={o.id} className="border-t border-hairline">
                  <td className="py-3 pr-4 font-semibold text-heading">{o.disease}</td>
                  <td className="py-3 pr-4">
                    <Badge tone={o.status === 'confirmed' ? 'alert' : 'warn'}>
                      {o.status === 'confirmed' ? 'Confirmado' : 'Suspeita'}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-body">{o.municipality}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-heading">
                    {o.isMine ? 'seu talhão' : `${formatNumber(o.distanceKm, 1)} km`}
                  </td>
                  <td className="py-3 text-right tabular-nums text-heading">{formatDayMonth(o.reportedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default OutbreakList;
