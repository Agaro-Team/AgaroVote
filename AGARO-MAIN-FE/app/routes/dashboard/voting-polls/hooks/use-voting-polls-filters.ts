/**
 * useVotingPollsFilters Hook
 *
 * Reusable hook for managing voting polls filter state via URL parameters.
 * Provides centralized filter state management for search, sort, and active status.
 *
 * Features:
 * - URL state persistence (filters survive page refresh)
 * - Type-safe filter parameters
 * - Default values matching backend expectations
 * - Helper methods for common operations
 */
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';
import { SortOrder } from '~/lib/api/api.interface';
import { PollSortBy } from '~/lib/api/poll/poll.interface';

/**
 * Default filter values
 */
export const DEFAULT_FILTERS = {
  limit: 9,
  q: '',
  sortBy: PollSortBy.CREATED_AT,
  order: SortOrder.DESC,
  isActive: true,
} as const;

/**
 * Filter state parsers for nuqs
 */
const filterParsers = {
  limit: parseAsInteger.withDefault(DEFAULT_FILTERS.limit),
  q: parseAsString.withDefault(DEFAULT_FILTERS.q),
  sortBy: parseAsStringEnum<PollSortBy>(Object.values(PollSortBy)).withDefault(
    DEFAULT_FILTERS.sortBy
  ),
  order: parseAsStringEnum<SortOrder>(Object.values(SortOrder)).withDefault(DEFAULT_FILTERS.order),
  isActive: parseAsBoolean.withDefault(DEFAULT_FILTERS.isActive),
} as const;

/**
 * Hook options
 */
interface UseVotingPollsFiltersOptions {
  /**
   * Whether to use push or replace for history navigation
   * @default 'push'
   */
  history?: 'push' | 'replace';
  /**
   * Whether to use shallow routing (client-side only)
   * @default false
   */
  shallow?: boolean;
}

/**
 * Hook return type
 */
export interface UseVotingPollsFiltersReturn {
  /** Current filter values */
  filters: {
    limit: number;
    q: string;
    sortBy: PollSortBy;
    order: SortOrder;
    isActive: boolean;
  };
  /** Update one or more filter values */
  setFilters: (
    updates: Partial<{
      limit: number;
      q: string;
      sortBy: PollSortBy;
      order: SortOrder;
      isActive: boolean;
    }>
  ) => Promise<URLSearchParams>;
  /** Reset all filters to default values */
  resetFilters: () => Promise<URLSearchParams>;
  /** Toggle sort order between ASC and DESC */
  toggleSortOrder: () => Promise<URLSearchParams>;
  /** Check if any filters are active (different from defaults) */
  hasActiveFilters: boolean;
}

/**
 * Reusable hook for managing voting polls filter state
 *
 * @example
 * ```tsx
 * const { filters, setFilters, resetFilters, hasActiveFilters } = useVotingPollsFilters();
 *
 * // Update search
 * setFilters({ q: 'governance' });
 *
 * // Update sort
 * setFilters({ sortBy: PollSortBy.TITLE, order: SortOrder.ASC });
 *
 * // Reset all
 * resetFilters();
 * ```
 */
export function useVotingPollsFilters(
  options: UseVotingPollsFiltersOptions = {}
): UseVotingPollsFiltersReturn {
  const { history = 'push', shallow = false } = options;

  const [filters, setFilters] = useQueryStates(filterParsers, {
    history,
    shallow,
  });

  /**
   * Reset all filters to default values
   */
  const resetFilters = () => {
    return setFilters({
      limit: DEFAULT_FILTERS.limit,
      q: DEFAULT_FILTERS.q,
      sortBy: DEFAULT_FILTERS.sortBy,
      order: DEFAULT_FILTERS.order,
      isActive: DEFAULT_FILTERS.isActive,
    });
  };

  /**
   * Toggle sort order between ASC and DESC
   */
  const toggleSortOrder = () => {
    return setFilters({
      order: filters.order === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
    });
  };

  /**
   * Check if any filters differ from defaults
   */
  const hasActiveFilters =
    filters.q !== DEFAULT_FILTERS.q ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.order !== DEFAULT_FILTERS.order ||
    filters.isActive !== DEFAULT_FILTERS.isActive;

  return {
    filters,
    setFilters,
    resetFilters,
    toggleSortOrder,
    hasActiveFilters,
  };
}
