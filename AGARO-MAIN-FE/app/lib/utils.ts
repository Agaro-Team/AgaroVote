import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { GetNextPageParamFunction } from '@tanstack/react-query';

import type { ApiListResponse, ApiResponse } from './api/api.interface';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Merge multiple records into a single record
 * @param keys
 * @returns
 */
export const mergeRecords = <T extends Record<string, any>>(...keys: T[]) => {
  return keys.reduce((acc, key) => {
    return { ...acc, ...key };
  }, {} as T);
};

/**
 * Reusable createGetNextPageParam function for infinite queries using closure
 *
 * @param limit - Items per page (default: 10)
 * @returns GetNextPageParamFunction that calculates next page based on total items
 *
 * @example
 * ```ts
 * infiniteQueryOptions({
 *   queryKey: ['items'],
 *   queryFn: fetchItems,
 *   getNextPageParam: createGetNextPageParam(20), // 20 items per page
 *   initialPageParam: 1,
 * })
 * ```
 *
 * **Pros:**
 * - Clean, concise syntax
 * - Captures `limit` in closure, no need to pass it repeatedly
 * - Type-safe with TypeScript
 * - Easy to use inline in query options
 * - Memory efficient (closure created once per query)
 *
 * **Cons:**
 * - Each call creates a new function (minimal overhead)
 * - Limit is "baked in" - can't change dynamically after creation
 * - Less explicit than passing limit in each call
 */
export const createGetNextPageParam =
  (limit: number = 10) =>
  (lastPage: ApiResponse<ApiListResponse<any>>, allPages: ApiResponse<ApiListResponse<any>>[]) => {
    const currentPage = allPages.length;
    const totalPages = Math.ceil((lastPage?.data?.meta?.total ?? 0) / limit);
    return currentPage < totalPages ? currentPage + 1 : undefined;
  };
