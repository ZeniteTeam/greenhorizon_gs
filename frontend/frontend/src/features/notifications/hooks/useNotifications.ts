import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../../../api/monitoring/fieldExtras';
import { queryKeys } from '../../../services/queryClient';
import { useNotificationsStore } from '../../../store/notificationsStore';

export function useNotifications() {
  const query = useQuery({ queryKey: queryKeys.notifications, queryFn: getNotifications });
  const readIds = useNotificationsStore((s) => s.readIds);
  const items = (query.data ?? []).map((n) => ({ ...n, read: readIds.includes(n.id) }));
  return { ...query, items, unread: items.filter((n) => !n.read).length };
}
