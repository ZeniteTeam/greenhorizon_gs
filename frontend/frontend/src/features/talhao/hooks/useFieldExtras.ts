import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addFieldNote,
  getFieldEvents,
  getFieldVisits,
  getFieldWeather,
  requestVisit,
  type VisitRequest,
} from '../../../api/monitoring/fieldExtras';
import { queryKeys } from '../../../services/queryClient';

export function useFieldWeather(fieldId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.fieldWeather(fieldId ?? ''),
    queryFn: () => getFieldWeather(fieldId!),
    enabled: Boolean(fieldId),
  });
}

export function useFieldEvents(fieldId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.fieldEvents(fieldId ?? ''),
    queryFn: () => getFieldEvents(fieldId!),
    enabled: Boolean(fieldId),
  });
}

export function useFieldVisits(fieldId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.fieldVisits(fieldId ?? ''),
    queryFn: () => getFieldVisits(fieldId!),
    enabled: Boolean(fieldId),
  });
}

export function useRequestVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: VisitRequest) => requestVisit(request),
    onSuccess: (_visit, request) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.fieldVisits(request.fieldId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.fieldEvents(request.fieldId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
      ]),
  });
}

export function useAddNote(fieldId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ text, author }: { text: string; author: string }) => addFieldNote(fieldId, text, author),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.fieldEvents(fieldId) }),
  });
}
