import { useQuery } from '@tanstack/react-query';
import { getFields } from '../../../api/monitoring/fields';
import { queryKeys } from '../../../services/queryClient';

export function useFields() {
  return useQuery({ queryKey: queryKeys.fields, queryFn: getFields });
}
