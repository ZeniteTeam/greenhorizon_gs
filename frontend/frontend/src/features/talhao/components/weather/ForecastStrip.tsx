import { CloudDrizzle, CloudRain, CloudSun, Droplets } from 'lucide-react';
import { Card } from '../../../../components/Card';
import type { ForecastDay } from '../../../../types/monitoring';
import { formatDayMonth, formatWeekday } from '../../../../utils/format';

function WeatherIcon({ rainMm }: { rainMm: number }) {
  if (rainMm >= 10) return <CloudRain size={26} className="text-rain" aria-label="Chuva forte" />;
  if (rainMm >= 3) return <CloudDrizzle size={26} className="text-rain" aria-label="Chuva fraca" />;
  return <CloudSun size={26} className="text-warn" aria-label="Pouca chuva" />;
}

export function ForecastStrip({ forecast }: { forecast: ForecastDay[] }) {
  return (
    <Card padding={24} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-heading">Próximos 7 dias</h2>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {forecast.map((day, i) => (
          <li key={day.date} className={`flex flex-col items-center gap-2 rounded-md p-3 text-center ${i === 0 ? 'bg-tint' : 'bg-page'}`}>
            <span className="text-xs font-semibold text-heading capitalize">
              {i === 0 ? 'Amanhã' : formatWeekday(day.date)}
              <span className="block font-normal text-subtle">{formatDayMonth(day.date)}</span>
            </span>
            <WeatherIcon rainMm={day.rainMm} />
            <span className="text-sm tabular-nums text-heading">
              <b>{day.maxC}°</b> <span className="text-subtle">{day.minC}°</span>
            </span>
            <span className="text-xs tabular-nums text-body">
              {day.rainMm} mm · {day.rainChance}%
            </span>
            <span className="flex items-center gap-1 text-xs tabular-nums text-subtle" title="Horas de folha molhada">
              <Droplets size={12} aria-hidden="true" />
              {day.leafWetnessHours} h
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-subtle">
        mm · chance de chuva · <Droplets size={11} className="inline" aria-hidden="true" /> horas de folha molhada
      </p>
    </Card>
  );
}

export default ForecastStrip;
