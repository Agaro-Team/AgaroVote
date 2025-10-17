import { QueryClient } from '@tanstack/react-query';

import { hashFn } from '@wagmi/core/query';

import { mergeRecords } from '../utils';

const GC_TIME = 10000; // 10 seconds
const STALE_TIME = 10000; // 10 seconds

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: hashFn, // For proper serialization in devtools
      gcTime: GC_TIME,
      staleTime: STALE_TIME,
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
