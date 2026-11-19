import { AlertOctagon, CalendarCheck, CloudRain, Radar, Satellite, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppNotification, NotificationKind } from '../../../types/monitoring';
import { formatDayMonth } from '../../../utils/format';

const KIND_META: Record<NotificationKind, { icon: LucideIcon; iconClass: string }> = {
  zone: { icon: Radar, iconClass: 'bg-zone-bg text-zone' },
  outbreak: { icon: AlertOctagon, iconClass: 'bg-alert-bg text-alert' },
  risk: { icon: CloudRain, iconClass: 'bg-warn-bg text-warn' },
  pass: { icon: Satellite, iconClass: 'bg-info-bg text-info' },
  visit: { icon: CalendarCheck, iconClass: 'bg-tint text-brand' },
  diagnosis: { icon: Users, iconClass: 'bg-tint text-brand' },
};

interface NotificationItemProps {
  notification: AppNotification & { read: boolean };
  onOpen: () => void;
}

export function NotificationItem({ notification: n, onOpen }: NotificationItemProps) {
  const meta = KIND_META[n.kind];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-page ${n.read ? '' : 'bg-wash'}`}
    >
      <span className={`flex size-9 flex-shrink-0 items-center justify-center rounded-full ${meta.iconClass}`}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`text-sm leading-snug text-heading ${n.read ? 'font-medium' : 'font-semibold'}`}>{n.title}</span>
        <span className="text-xs leading-snug text-body">{n.body}</span>
        <span className="text-xs text-subtle">{formatDayMonth(n.createdAt)}</span>
      </span>
      {!n.read && <span className="mt-1.5 size-2 flex-shrink-0 rounded-full bg-brand" aria-label="Não lida" />}
    </button>
  );
}

export default NotificationItem;
