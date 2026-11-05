import { QueryClient } from '@tanstack/react-query';

import { getApiError } from '../utils/apiError';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retry network hiccups once; never retry 4xx answers (they won't change).
      retry: (failureCount, error) => {
        const { status } = getApiError(error);
        return failureCount < 1 && (status === undefined || status >= 500);
      },
    },
    mutations: { retry: false },
  },
});
