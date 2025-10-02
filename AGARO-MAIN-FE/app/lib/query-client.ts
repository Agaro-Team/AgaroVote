import { QueryClient } from "@tanstack/react-query";
import { hashFn } from "@wagmi/core/query";
import { postsQueryKeys } from "./query-client/query-keys/posts";
import { mergeRecords } from "./utils";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (required for persistence)
      queryKeyHashFn: hashFn, // For proper serialization in devtools
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (
          error instanceof Error &&
          "status" in error &&
          typeof error.status === "number"
        ) {
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
export const queryKeys = mergeRecords(postsQueryKeys);
