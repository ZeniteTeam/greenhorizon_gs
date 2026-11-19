import { useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, FileText, Radar, TrendingDown } from 'lucide-react';
import { AlertBanner } from '../../../components/AlertBanner';
import { Button } from '../../../components/Button';
import { PageHeader } from '../../../components/PageHeader';
import { QueryState } from '../../../components/QueryState';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { useNavigation } from '../../../store/navigationStore';
import type { FieldDetail, MapLayer, TechnicianVisit } from '../../../types/monitoring';
import { formatDayMonth, formatFullDate, formatNumber } from '../../../utils/format';
import { SeasonCharts } from '../components/charts/SeasonCharts';
import { EvidencePanel } from '../components/EvidencePanel';
import { FieldLog } from '../components/log/FieldLog';
import { PassReadings } from '../components/PassReadings';
import { SeasonTimeline } from '../components/SeasonTimeline';
import { StressMap } from '../components/StressMap';
import { VisitRequestDialog } from '../components/VisitRequestDialog';
import { WeatherTab } from '../components/weather/WeatherTab';
import { ZoneCard } from '../components/ZoneCard';
import { useFieldDetail } from '../hooks/useFieldDetail';
import { useFieldVisits } from '../hooks/useFieldExtras';
import { previousReading } from '../utils/pixelGrid';

type Tab = 'overview' | 'weather' | 'log';

const TABS = [
  { value: 'overview', label: 'Visão geral' },
  { value: 'weather', label: 'Clima' },
  { value: 'log', label: 'Registro' },
] as const;

const LAYERS = [
  { value: 'ndvi', label: 'Vigor' },
  { value: 'ndmi', label: 'Umidade' },
  { value: 'change', label: 'Mudança em 10 dias' },
] as const;

export function FieldDetailScreen() {
  const fieldId = useNavigation((s) => s.fieldId);
  const navigate = useNavigation((s) => s.navigate);
  const { data, isLoading, error, refetch } = useFieldDetail(fieldId);

  return (
    <div className="flex flex-col gap-8">
      <button
        type="button"
        onClick={() => navigate('fields')}
        className="flex w-fit items-center gap-2 text-sm font-semibold text-brand"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Seus talhões
      </button>
      <QueryState loading={isLoading} error={error} onRetry={() => refetch()} loadingLabel="Carregando a safra do talhão…" />
      {data && <FieldDetailContent detail={data} />}
    </div>
  );
}

function FieldDetailContent({ detail }: { detail: FieldDetail }) {
  const navigate = useNavigation((s) => s.navigate);
  const [tab, setTab] = useState<Tab>('overview');
  const [visitOpen, setVisitOpen] = useState(false);
  const zone = detail.zones[0];
  const { data: visits } = useFieldVisits(detail.id);
  const visit = visits?.find((v) => v.status === 'scheduled');
  const goScout = () => navigate('scout', { fieldId: detail.id, zoneId: zone?.id });

  return (
    <>
      <PageHeader
        eyebrow={`${detail.farm} · ${detail.municipality}`}
        title={`${detail.name} · ${detail.crop}`}
        description={`${formatNumber(detail.areaHa, 1)} ha · plantio em ${formatFullDate(detail.plantedAt)} · ${detail.daysAfterPlanting} dias · ${detail.stage}`}
        actions={
          <>
            <span className="flex items-center gap-2 rounded-full bg-tint px-3 py-1.5 text-xs font-semibold text-section">
              <Radar size={14} aria-hidden="true" />
              Próxima passagem {formatDayMonth(detail.nextPass)}
            </span>
            <Button variant="secondary" size="sm" iconLeft={<FileText size={16} />} onClick={() => navigate('report', { fieldId: detail.id })}>
              Relatório da safra
            </Button>
          </>
        }
      />

      {zone?.status === 'awaiting-photo' && (
        <AlertBanner
          tone="alert"
          icon={<TrendingDown size={22} aria-hidden="true" />}
          title={`${formatNumber(zone.areaHa, 1)} ha com queda de ${formatNumber(Math.abs(zone.vigorDropPct), 0)}% de vigor em ${zone.windowDays} dias`}
          action={<Button iconLeft={<Camera size={18} />} onClick={goScout}>Confirmar em campo</Button>}
        >
          Choveu normalmente, então seca é improvável: <b>provável praga ou doença</b>. Vá até o ponto marcado e
          fotografe uma folha.
        </AlertBanner>
      )}
      {detail.health === 'attention' && (
        <AlertBanner tone="warn" icon={<TrendingDown size={22} aria-hidden="true" />} title="Talhão inteiro abaixo da curva esperada">
          O vigor está uniforme, mas abaixo do esperado para {detail.stage.split(' · ')[0]}. Sem mancha localizada, o
          padrão sugere nutrição ou falha de estande. Vale agendar uma visita técnica.
        </AlertBanner>
      )}
      {detail.health === 'on-track' && (
        <AlertBanner tone="good" icon={<CheckCircle2 size={22} aria-hidden="true" />} title="Lavoura dentro do esperado para a fase">
          Nenhuma área fugiu da curva esperada na última passagem.
        </AlertBanner>
      )}

      <SegmentedControl label="Seções do talhão" options={TABS} value={tab} onChange={setTab} />

      {tab === 'overview' && (
        <OverviewTab
          detail={detail}
          visit={visit}
          onScout={goScout}
          onCommunity={() => navigate('community')}
          onRequestVisit={() => setVisitOpen(true)}
        />
      )}
      {tab === 'weather' && <WeatherTab fieldId={detail.id} />}
      {tab === 'log' && <FieldLog fieldId={detail.id} />}

      <VisitRequestDialog
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        fieldId={detail.id}
        zoneId={zone?.id}
        today={detail.today}
      />
    </>
  );
}

interface OverviewTabProps {
  detail: FieldDetail;
  visit?: TechnicianVisit;
  onScout: () => void;
  onCommunity: () => void;
  onRequestVisit: () => void;
}

function OverviewTab({ detail, visit, onScout, onCommunity, onRequestVisit }: OverviewTabProps) {
  const [selectedIndex, setSelectedIndex] = useState(detail.samples.length - 1);
  const [layer, setLayer] = useState<MapLayer>('ndvi');

  const zone = detail.zones[0];
  const sample = detail.samples[selectedIndex];
  const previous = previousReading(detail.samples, selectedIndex);
  const alertIndex = zone ? detail.samples.findIndex((s) => s.date === zone.detectedAt) : -1;
  const alertDap = alertIndex >= 0 ? detail.samples[alertIndex].dap : undefined;
  const showZone = Boolean(zone) && zone.status !== 'dismissed' && alertDap !== undefined && sample.dap >= alertDap;

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <SegmentedControl label="Camada do mapa" size="sm" options={LAYERS} value={layer} onChange={setLayer} />
          <StressMap fieldId={detail.id} boundary={detail.boundary} zone={zone} sample={sample} previous={previous} layer={layer} showZone={showZone} />
          <SeasonTimeline
            samples={detail.samples}
            index={selectedIndex}
            onChange={setSelectedIndex}
            alertIndex={alertIndex >= 0 ? alertIndex : undefined}
          />
        </div>
        <div className="flex flex-col gap-4">
          {zone ? (
            <>
              <ZoneCard zone={zone} visit={visit} onScout={onScout} onCommunity={onCommunity} onRequestVisit={onRequestVisit} />
              <EvidencePanel hypothesis={zone.hypothesis} />
            </>
          ) : (
            <>
              <PassReadings sample={sample} expected={detail.expected.find((p) => p.dap === sample.dap)} />
              {detail.health === 'attention' && (
                <Button variant="secondary" fullWidth onClick={onRequestVisit} disabled={Boolean(visit)}>
                  {visit ? `Visita agendada para ${formatDayMonth(visit.date)}` : 'Pedir visita técnica'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <SeasonCharts detail={detail} selectedIndex={selectedIndex} onSelect={setSelectedIndex} alertDap={alertDap} />
    </>
  );
}

export default FieldDetailScreen;
