import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Logo } from '../../../components/Logo';
import { QueryState } from '../../../components/QueryState';
import { HEALTH_META } from '../../../constants/health';
import { useElementWidth } from '../../../hooks/useElementWidth';
import { useAuthStore } from '../../../store/authStore';
import { useNavigation } from '../../../store/navigationStore';
import type { FieldDetail, FieldEvent } from '../../../types/monitoring';
import { formatFullDate, formatNumber, formatPercent } from '../../../utils/format';
import { NdviChart } from '../../talhao/components/charts/NdviChart';
import { useFieldDetail } from '../../talhao/hooks/useFieldDetail';
import { useFieldEvents } from '../../talhao/hooks/useFieldExtras';
import { makeXScale } from '../../talhao/utils/chartLayout';
import { ReportFacts, ReportSection } from '../components/ReportSection';

const OCCURRENCE_KINDS: ReadonlyArray<FieldEvent['kind']> = ['zone', 'diagnosis', 'dismissal', 'visit', 'note'];
const noop = () => undefined;

export function SeasonReportScreen() {
  const fieldId = useNavigation((s) => s.fieldId);
  const navigate = useNavigation((s) => s.navigate);
  const detail = useFieldDetail(fieldId);
  const events = useFieldEvents(fieldId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => navigate('field', { fieldId })}
          className="flex w-fit items-center gap-2 text-sm font-semibold text-brand"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar ao talhão
        </button>
        <Button iconLeft={<Printer size={18} />} onClick={() => window.print()} disabled={!detail.data}>
          Imprimir ou salvar PDF
        </Button>
      </div>

      <QueryState loading={detail.isLoading} error={detail.error} onRetry={() => detail.refetch()} />
      {detail.data && <ReportDocument detail={detail.data} events={events.data ?? []} />}
    </div>
  );
}

function ReportDocument({ detail, events }: { detail: FieldDetail; events: FieldEvent[] }) {
  const producer = useAuthStore((s) => s.username) ?? 'Produtor';
  const { ref, width } = useElementWidth<HTMLDivElement>(720);
  const valid = detail.samples.filter((s) => s.fieldNdvi !== null);
  const rain = detail.rain.reduce((sum, r) => sum + r.mm, 0);
  const normal = detail.rain.reduce((sum, r) => sum + r.normalMm, 0);
  const occurrences = events.filter((e) => OCCURRENCE_KINDS.includes(e.kind));
  const [lat, lng] = detail.centroid;

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-lg bg-card p-6 shadow-card sm:p-10 print:max-w-none print:p-0 print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Logo tone="onLight" size={20} />
          <h1 className="text-2xl font-bold text-section">Relatório de acompanhamento da safra</h1>
          <span className="text-sm text-body">Emitido em {formatFullDate(detail.today)}</span>
        </div>
      </header>

      <ReportSection title="Identificação">
        <ReportFacts
          items={[
            { label: 'Produtor', value: producer },
            { label: 'Propriedade', value: detail.farm },
            { label: 'Município', value: detail.municipality },
            { label: 'Talhão', value: detail.name },
            { label: 'Cultura', value: detail.crop },
            { label: 'Área', value: `${formatNumber(detail.areaHa, 1)} ha` },
            { label: 'Plantio', value: formatFullDate(detail.plantedAt) },
            { label: 'Fase atual', value: detail.stage },
            { label: 'Centro do talhão', value: `${formatNumber(lat, 5)}, ${formatNumber(lng, 5)}` },
          ]}
        />
      </ReportSection>

      <ReportSection title="Resumo do monitoramento">
        <ReportFacts
          items={[
            { label: 'Situação', value: HEALTH_META[detail.health].label },
            { label: 'NDVI na última passagem', value: formatNumber(detail.ndviNow) },
            { label: 'Faixa esperada', value: `${formatNumber(detail.expectedNow[0])}–${formatNumber(detail.expectedNow[1])}` },
            { label: 'Passagens analisadas', value: String(detail.samples.length) },
            { label: 'Passagens com leitura', value: String(valid.length) },
            { label: 'Chuva no ciclo', value: `${rain} mm (${formatPercent((rain / normal) * 100)} da média)` },
          ]}
        />
      </ReportSection>

      <ReportSection title="Curva de vigor (NDVI)">
        <div ref={ref} className="w-full">
          <NdviChart
            detail={detail}
            width={width}
            x={makeXScale(width, detail.seasonLengthDays)}
            activeIndex={null}
            selectedIndex={detail.samples.length - 1}
            onPointer={noop}
            onLeave={noop}
            onSelect={noop}
            onFocusChange={noop}
          />
        </div>
        <p className="text-xs text-subtle">
          Linha verde: média do talhão. Faixa clara: vigor esperado para {detail.crop.toLowerCase()} em cada fase.
          {detail.zones.length > 0 && ' Linha magenta: zona sob estresse.'}
        </p>
      </ReportSection>

      <ReportSection title="Ocorrências registradas">
        {occurrences.length === 0 ? (
          <p className="text-sm text-body">Nenhuma ocorrência registrada no ciclo.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-subtle">
              <tr>
                <th scope="col" className="py-2 pr-4 font-semibold">Data</th>
                <th scope="col" className="py-2 font-semibold">Ocorrência</th>
              </tr>
            </thead>
            <tbody>
              {occurrences.map((e) => (
                <tr key={e.id} className="border-t border-hairline align-top">
                  <td className="py-2 pr-4 whitespace-nowrap tabular-nums text-heading">{formatFullDate(e.date)}</td>
                  <td className="py-2 text-heading">
                    <span className="font-semibold">{e.title}</span>
                    {e.description && <span className="block text-body">{e.description}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ReportSection>

      <footer className="border-t border-hairline pt-4 text-xs leading-relaxed text-subtle">
        Gerado a partir de imagens Sentinel-2 e de dados de chuva CHIRPS. Pode ser anexado como documento de apoio a
        pedidos de Proagro ou Garantia-Safra e não substitui o laudo de um técnico.
      </footer>
    </article>
  );
}

export default SeasonReportScreen;
