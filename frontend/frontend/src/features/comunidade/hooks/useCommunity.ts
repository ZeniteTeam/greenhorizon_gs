import { useQuery } from '@tanstack/react-query';
import { getCommunityOverview } from '../../../api/monitoring/community';
import { queryKeys } from '../../../services/queryClient';

export function useCommunity() {
  return useQuery({ queryKey: queryKeys.community, queryFn: () => getCommunityOverview() });
}
