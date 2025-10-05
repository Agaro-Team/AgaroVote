import { QueryClient } from '@tanstack/react-query';

import { hashFn } from '@wagmi/core/query';

import { mergeRecords } from '../utils';

const gcTime = 1000 * 60 * 60 * 24; // 24 hours
const staleTime = 1000 * 60 * 5; // 5 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime,
      staleTime,
      queryKeyHashFn: hashFn, // For proper serialization in devtools
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Query keys factory for better organization
export const queryKeys = mergeRecords({});
