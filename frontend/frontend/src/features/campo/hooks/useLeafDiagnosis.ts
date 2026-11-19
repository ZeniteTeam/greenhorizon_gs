import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classifyLeaf, confirmZone, dismissZone } from '../../../api/monitoring/diagnosis';
import { queryKeys } from '../../../services/queryClient';

export function useClassifyLeaf() {
  return useMutation({ mutationFn: classifyLeaf });
}

export function useZoneDecision() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.fields }),
      queryClient.invalidateQueries({ queryKey: queryKeys.community }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
    ]);

  const confirm = useMutation({
    mutationFn: ({ zoneId, diagnosis }: { zoneId: string; diagnosis: string }) => confirmZone(zoneId, diagnosis),
    onSuccess: refresh,
  });

  const dismiss = useMutation({
    mutationFn: (zoneId: string) => dismissZone(zoneId),
    onSuccess: refresh,
  });

  return { confirm, dismiss };
}
