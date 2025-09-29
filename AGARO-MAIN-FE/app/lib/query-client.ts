import { QueryClient } from "@tanstack/react-query";

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

// Query keys factory for better organization
export const queryKeys = {
  // Example: users: ['users'] as const,
  // Example: user: (id: string) => ['users', id] as const,
  // Example: userPosts: (userId: string) => ['users', userId, 'posts'] as const,
} as const;
