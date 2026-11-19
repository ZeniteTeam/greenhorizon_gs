import { CalendarClock, LandPlot, Plus, Radar, TriangleAlert } from 'lucide-react';
import { AlertBanner } from '../../../components/AlertBanner';
import { Button } from '../../../components/Button';
import { MetricCard } from '../../../components/MetricCard';
import { PageHeader } from '../../../components/PageHeader';
import { QueryState } from '../../../components/QueryState';
import { useNavigation } from '../../../store/navigationStore';
import type { FieldSummary } from '../../../types/monitoring';
import { formatDayMonth, formatNumber } from '../../../utils/format';
import { FieldCard } from '../components/FieldCard';
import { useFields } from '../hooks/useFields';

function Summary({ fields }: { fields: FieldSummary[] }) {
  const area = fields.reduce((sum, f) => sum + f.areaHa, 0);
  const attention = fields.filter((f) => f.health !== 'on-track').length;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard label="Talhões" value={String(fields.length)} caption="monitorados" icon={<LandPlot size={20} />} emphasis="neutral" />
      <MetricCard label="Área" value={`${formatNumber(area, 1)} ha`} caption="no total" emphasis="neutral" />
      <MetricCard
        label="Pedem atenção"
        value={String(attention)}
        caption={attention === 1 ? 'talhão' : 'talhões'}
        icon={<TriangleAlert size={20} />}
        emphasis="neutral"
      />
      <MetricCard
        label="Próxima passagem"
        value={formatDayMonth(fields[0].nextPass)}
        caption={`última em ${formatDayMonth(fields[0].lastPass)}`}
        icon={<CalendarClock size={20} />}
        emphasis="neutral"
      />
    </div>
  );
}

export function FieldsScreen() {
  const navigate = useNavigation((s) => s.navigate);
  const { data: fields, isLoading, error, refetch } = useFields();
  const flagged = fields?.find((f) => f.openZones > 0);
  const farm = fields?.[0];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={farm ? `${farm.farm} · ${farm.municipality}` : 'Sua propriedade'}
        title="Seus talhões"
        actions={
          <Button variant="secondary" iconLeft={<Plus size={18} />} onClick={() => navigate('analysis')}>
            Adicionar talhão
          </Button>
        }
      />

      <QueryState loading={isLoading} error={error} onRetry={() => refetch()} loadingLabel="Buscando seus talhões…" />

      {flagged && (
        <AlertBanner
          tone="alert"
          icon={<Radar size={22} aria-hidden="true" />}
          title={`${flagged.name}: uma área está perdendo vigor`}
          action={<Button onClick={() => navigate('field', { fieldId: flagged.id })}>Ver onde está</Button>}
        >
          A média do talhão ainda parece normal, mas uma parte dele caiu abaixo da curva esperada para a{' '}
          {flagged.crop.toLowerCase()} nesta fase.
        </AlertBanner>
      )}

      {fields && fields.length > 0 && <Summary fields={fields} />}

      {fields && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <FieldCard key={field.id} field={field} onOpen={(id) => navigate('field', { fieldId: id })} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FieldsScreen;
