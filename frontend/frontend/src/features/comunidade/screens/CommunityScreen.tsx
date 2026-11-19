import { useMemo, useState } from 'react';
import { BellRing, Bug, LandPlot, SearchCheck } from 'lucide-react';
import { MetricCard } from '../../../components/MetricCard';
import { PageHeader } from '../../../components/PageHeader';
import { QueryState } from '../../../components/QueryState';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { usePreferences } from '../../../store/preferencesStore';
import type { CommunityOverview, OutbreakStatus } from '../../../types/monitoring';
import { addDays, formatNumber } from '../../../utils/format';
import { AlertFeed } from '../components/AlertFeed';
import { OutbreakList } from '../components/OutbreakList';
import { OutbreakMap } from '../components/OutbreakMap';
import { VisitPriorityList } from '../components/VisitPriorityList';
import { useCommunity } from '../hooks/useCommunity';

type StatusFilter = 'all' | OutbreakStatus;
type PeriodFilter = '7' | '14' | '30';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'suspected', label: 'Suspeitas' },
] as const;

const PERIOD_OPTIONS = [
  { value: '7', label: '7 dias' },
  { value: '14', label: '14 dias' },
  { value: '30', label: '30 dias' },
] as const;

export function CommunityScreen() {
  const { data, isLoading, error, refetch } = useCommunity();
  const radiusKm = usePreferences((s) => s.preferences.radiusKm);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={`Comunidade · raio de ${radiusKm} km`} title="Focos na sua região" />
      <QueryState loading={isLoading} error={error} onRetry={() => refetch()} loadingLabel="Montando o mapa regional…" />
      {data && <CommunityContent overview={data} radiusKm={radiusKm} />}
    </div>
  );
}

function CommunityContent({ overview, radiusKm }: { overview: CommunityOverview; radiusKm: number }) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [period, setPeriod] = useState<PeriodFilter>('14');
  const [disease, setDisease] = useState('all');

  const diseases = useMemo(
    () => Array.from(new Set(overview.outbreaks.map((o) => o.disease))).sort(),
    [overview.outbreaks],
  );

  const outbreaks = useMemo(() => {
    const since = addDays(overview.asOf, -Number(period));
    return overview.outbreaks.filter(
      (o) =>
        o.distanceKm <= radiusKm &&
        o.reportedAt >= since &&
        (status === 'all' || o.status === status) &&
        (disease === 'all' || o.disease === disease),
    );
  }, [overview, radiusKm, period, status, disease]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl label="Situação" size="sm" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        <SegmentedControl label="Período" size="sm" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        <label className="sr-only" htmlFor="disease-filter">
          Doença
        </label>
        <select
          id="disease-filter"
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
          className="h-9 rounded-md bg-hairline px-3 text-xs font-semibold text-heading outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="all">Todas as doenças</option>
          {diseases.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Focos confirmados"
          value={String(outbreaks.filter((o) => o.status === 'confirmed').length)}
          caption="por foto de campo"
          icon={<Bug size={20} />}
          emphasis="neutral"
        />
        <MetricCard
          label="Suspeitas"
          value={String(outbreaks.filter((o) => o.status === 'suspected').length)}
          caption="aguardando foto"
          icon={<SearchCheck size={20} />}
          emphasis="neutral"
        />
        <MetricCard
          label="Produtores avisados"
          value={String(overview.stats.producersAlerted)}
          caption="nesta semana"
          icon={<BellRing size={20} />}
          emphasis="neutral"
        />
        <MetricCard
          label="Área em risco"
          value={`${formatNumber(overview.stats.areaAtRiskHa, 0)} ha`}
          caption="a até 5 km de focos"
          icon={<LandPlot size={20} />}
          emphasis="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <OutbreakMap center={overview.center} radiusKm={radiusKm} outbreaks={outbreaks} />
        <AlertFeed alerts={overview.alerts} />
      </div>

      <OutbreakList outbreaks={outbreaks} />
      <VisitPriorityList visits={overview.visits} />
    </>
  );
}

export default CommunityScreen;
