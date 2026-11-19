import type { FieldDetail } from '../../../../types/monitoring';
import { formatDayMonth, formatNumber, formatPercent } from '../../../../utils/format';

const dash = '—';
const ndvi = (v: number | null) => (v === null ? dash : formatNumber(v));

export function SeasonTable({ detail }: { detail: FieldDetail }) {
  const hasZone = detail.zones.length > 0;

  return (
    <div className="max-h-80 overflow-auto rounded-md ring-1 ring-hairline">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-tint text-section">
          <tr>
            {['Passagem', 'Dias', 'Fase', 'NDVI talhão', ...(hasZone ? ['NDVI zona'] : []), 'Faixa esperada', 'NDMI', 'Chuva (média)', 'Nuvens'].map(
              (h) => (
                <th key={h} scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="tabular-nums text-heading">
          {detail.samples.map((s, i) => {
            const expected = detail.expected.find((p) => p.dap === s.dap);
            const rain = detail.rain[i];
            return (
              <tr key={s.dap} className="border-t border-hairline">
                <td className="px-3 py-2">{formatDayMonth(s.date)}</td>
                <td className="px-3 py-2">{s.dap}</td>
                <td className="px-3 py-2 whitespace-nowrap">{s.stage}</td>
                <td className="px-3 py-2">{ndvi(s.fieldNdvi)}</td>
                {hasZone && <td className="px-3 py-2">{ndvi(s.zoneNdvi)}</td>}
                <td className="px-3 py-2">
                  {expected ? `${formatNumber(expected.low)}–${formatNumber(expected.high)}` : dash}
                </td>
                <td className="px-3 py-2">{ndvi(s.fieldNdmi)}</td>
                <td className="px-3 py-2">{rain ? `${rain.mm} mm (${rain.normalMm})` : dash}</td>
                <td className="px-3 py-2">{formatPercent(s.cloudMasked * 100)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SeasonTable;
