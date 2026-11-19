import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigation } from '../../../store/navigationStore';
import { useNotificationsStore } from '../../../store/notificationsStore';
import type { AppNotification } from '../../../types/monitoring';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const { items, unread } = useNotifications();
  const { markRead, markAllRead } = useNotificationsStore();
  const navigate = useNavigation((s) => s.navigate);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!container.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function openNotification(n: AppNotification) {
    markRead(n.id);
    setOpen(false);
    if (n.target === 'field' && n.fieldId) navigate('field', { fieldId: n.fieldId });
    else if (n.target === 'community') navigate('community');
    else navigate('fields');
  }

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={unread > 0 ? `Notificações, ${unread} não lidas` : 'Notificações'}
        className="relative flex size-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
      >
        <Bell size={20} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-alert px-1 text-[10px] leading-4 font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="gh-modal fixed inset-x-3 top-[84px] z-[1000] overflow-hidden rounded-lg bg-card shadow-lg ring-1 ring-hairline sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-96">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="text-base font-semibold text-heading">Notificações</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead(items.map((n) => n.id))}
                className="text-xs font-semibold text-brand"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-[60vh] divide-y divide-hairline overflow-auto">
            {items.length === 0 ? (
              <p className="p-6 text-center text-sm text-body">Nenhuma notificação por enquanto.</p>
            ) : (
              items.map((n) => <NotificationItem key={n.id} notification={n} onOpen={() => openNotification(n)} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
