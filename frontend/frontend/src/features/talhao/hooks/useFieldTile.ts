import { useQuery } from '@tanstack/react-query';
import { getFieldTile, type FieldTileRequest } from '../../../api/monitoring/fields';
import { queryKeys } from '../../../services/queryClient';

/** Earth Engine tile URLs stay valid for a few hours; refresh well before that. */
const TILE_URL_LIFETIME_MS = 60 * 60 * 1000;

/** Real satellite pixels for one pass and layer. Pass null to skip (demo mode, cloudy pass). */
export function useFieldTile(request: FieldTileRequest | null) {
  return useQuery({
    queryKey: queryKeys.fieldTile(
      request?.fieldId ?? '',
      request?.date ?? '',
      request?.layer ?? 'ndvi',
      request?.previousDate ?? '',
    ),
    queryFn: () => getFieldTile(request!),
    enabled: request !== null,
    staleTime: TILE_URL_LIFETIME_MS,
  });
}
