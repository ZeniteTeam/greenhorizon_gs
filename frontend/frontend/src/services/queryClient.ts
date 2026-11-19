import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const queryKeys = {
  fields: ['fields'] as const,
  field: (id: string) => ['fields', id] as const,
  fieldWeather: (id: string) => ['fields', id, 'weather'] as const,
  fieldEvents: (id: string) => ['fields', id, 'events'] as const,
  fieldVisits: (id: string) => ['fields', id, 'visits'] as const,
  fieldTile: (id: string, date: string, layer: string, previousDate: string) =>
    ['fields', id, 'tile', date, layer, previousDate] as const,
  community: ['community'] as const,
  notifications: ['notifications'] as const,
};
