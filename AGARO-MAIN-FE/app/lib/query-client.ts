import { QueryClient } from "@tanstack/react-query";
import { postsQueryKeys } from "./query-client/query-keys/posts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
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

const mergedQueryKeys = <T extends Record<string, any>>(...keys: T[]) => {
  return keys.reduce((acc, key) => {
    return { ...acc, ...key };
  }, {} as T);
};

// Query keys factory for better organization
export const queryKeys = mergedQueryKeys(postsQueryKeys);
