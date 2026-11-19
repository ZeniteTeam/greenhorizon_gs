import { CloudRain } from 'lucide-react';
import { MetricCard } from '../../../../components/MetricCard';
import { QueryState } from '../../../../components/QueryState';
import { formatPercent } from '../../../../utils/format';
import { useFieldWeather } from '../../hooks/useFieldExtras';
import { DiseaseRiskCard } from './DiseaseRiskCard';
import { ForecastStrip } from './ForecastStrip';

export function WeatherTab({ fieldId }: { fieldId: string }) {
  const { data, isLoading, error, refetch } = useFieldWeather(fieldId);

  if (!data) {
    return <QueryState loading={isLoading} error={error} onRetry={() => refetch()} loadingLabel="Buscando a previsão…" />;
  }

  const weekRain = data.forecast.reduce((sum, d) => sum + d.rainMm, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Chuva nos últimos 30 dias"
          value={`${data.rain30dMm} mm`}
          caption={`${formatPercent((data.rain30dMm / data.normal30dMm) * 100)} da média histórica`}
          icon={<CloudRain size={20} />}
          emphasis="neutral"
        />
        <MetricCard
          label="Previsão para 7 dias"
          value={`${weekRain} mm`}
          caption={`${data.forecast.filter((d) => d.rainMm >= 5).length} dias com chuva`}
          emphasis="neutral"
        />
        <MetricCard
          label="Folha molhada"
          value={`${Math.round(data.forecast.reduce((s, d) => s + d.leafWetnessHours, 0) / data.forecast.length)} h/dia`}
          caption="média da semana"
          emphasis="neutral"
        />
      </div>
      <ForecastStrip forecast={data.forecast} />
      <DiseaseRiskCard risks={data.risks} />
    </div>
  );
}

export default WeatherTab;
