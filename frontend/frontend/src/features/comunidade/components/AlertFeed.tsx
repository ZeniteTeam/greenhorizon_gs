import { AlertOctagon, Eye, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../../../components/Card';
import type { AlertSeverity, CommunityAlert } from '../../../types/monitoring';
import { formatDayMonth } from '../../../utils/format';

const SEVERITY_META: Record<AlertSeverity, { icon: LucideIcon; label: string; iconClass: string }> = {
  act: { icon: AlertOctagon, label: 'Agir', iconClass: 'bg-alert-bg text-alert' },
  watch: { icon: Eye, label: 'Monitorar', iconClass: 'bg-warn-bg text-warn' },
  info: { icon: Info, label: 'Informativo', iconClass: 'bg-info-bg text-info' },
};

export function AlertFeed({ alerts }: { alerts: CommunityAlert[] }) {
  return (
    <Card padding={20} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-heading">Seus alertas</h2>
      <ul className="flex flex-col gap-4">
        {alerts.map((alert) => {
          const meta = SEVERITY_META[alert.severity];
          const Icon = meta.icon;
          return (
            <li key={alert.id} className="gh-reveal flex gap-3">
              <span className={`flex size-9 flex-shrink-0 items-center justify-center rounded-full ${meta.iconClass}`}>
                <Icon size={17} aria-label={meta.label} />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold leading-snug text-heading">{alert.title}</span>
                <span className="text-sm leading-snug text-body">{alert.body}</span>
                <span className="text-xs text-subtle">
                  {meta.label} · {formatDayMonth(alert.createdAt)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default AlertFeed;
