import { useQuery } from '@tanstack/react-query';
import { getFieldDetail } from '../../../api/monitoring/fields';
import { queryKeys } from '../../../services/queryClient';

export function useFieldDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.field(id ?? ''),
    queryFn: () => getFieldDetail(id!),
    enabled: Boolean(id),
  });
}
