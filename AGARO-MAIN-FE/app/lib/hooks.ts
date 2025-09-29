import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "./api";
import { queryKeys } from "./query-client";

// Custom hook for handling API errors
export function useApiError() {
  return (error: unknown) => {
    if (error instanceof ApiError) {
      console.error(`API Error ${error.status}: ${error.message}`);
      // You can add toast notifications or other error handling here
    } else {
      console.error("Unknown error:", error);
    }
  };
}

// Example query hooks (replace with your actual data fetching logic)
export function useExampleQuery() {
  return useQuery({
    queryKey: ["example"],
    queryFn: () => apiClient<{ message: string }>("/api/example"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Example mutation hooks
export function useExampleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { message: string }) =>
      apiClient("/api/example", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["example"] });
    },
    onError: useApiError(),
  });
}

// Utility hook for prefetching
export function usePrefetchQuery() {
  const queryClient = useQueryClient();

  return {
    prefetchExample: () => {
      queryClient.prefetchQuery({
        queryKey: ["example"],
        queryFn: () => apiClient<{ message: string }>("/api/example"),
        staleTime: 1000 * 60 * 5,
      });
    },
  };
}
