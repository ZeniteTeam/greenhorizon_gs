import { ChevronRight, Satellite } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { CROP_ICONS, HEALTH_META } from '../../../constants/health';
import type { FieldSummary } from '../../../types/monitoring';
import { formatDayMonth, formatNumber } from '../../../utils/format';
import { Sparkline } from './Sparkline';

interface FieldCardProps {
  field: FieldSummary;
  onOpen: (id: string) => void;
}

export function FieldCard({ field, onOpen }: FieldCardProps) {
  const health = HEALTH_META[field.health];

  return (
    <button
      type="button"
      onClick={() => onOpen(field.id)}
      className="gh-historyrow flex w-full flex-col gap-5 rounded-lg bg-card p-5 text-left shadow-card transition"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-12 flex-shrink-0 items-center justify-center rounded-md bg-tint">
          <img src={CROP_ICONS[field.crop]} alt="" width={30} height={30} className="object-contain" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-lg font-semibold text-heading">
            {field.name} · {field.crop}
          </span>
          <span className="truncate text-sm text-body">
            {formatNumber(field.areaHa, 1)} ha · {field.stage}
          </span>
        </div>
        <ChevronRight size={20} className="mt-1 flex-shrink-0 text-subtle" aria-hidden="true" />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="gh-eyebrow">NDVI agora</span>
          <span className="text-3xl font-bold text-heading">{formatNumber(field.ndviNow)}</span>
          <span className="text-xs text-body">
            Esperado {formatNumber(field.expectedNow[0])}–{formatNumber(field.expectedNow[1])}
          </span>
        </div>
        <Sparkline values={field.trend} expected={field.expectedNow} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <Badge tone={health.tone}>
          {field.openZones > 0
            ? `${field.openZones} ${field.openZones === 1 ? 'zona' : 'zonas'} sob estresse`
            : health.label}
        </Badge>
        <span className="flex items-center gap-1.5 text-xs text-subtle">
          <Satellite size={14} aria-hidden="true" />
          Passagem {formatDayMonth(field.lastPass)} · próxima {formatDayMonth(field.nextPass)}
        </span>
      </div>
    </button>
  );
}

export default FieldCard;
