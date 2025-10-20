/**
 * Dashboard Query Keys and Query Options
 *
 * Organized query keys and query options for dashboard data fetching
 */
import { dashboardService } from '~/lib/api/dashboard/dashboard.service';

import { queryOptions } from '@tanstack/react-query';

/**
 * Query keys factory for dashboard queries
 * Follows the pattern: ['dashboard'] -> ['dashboard', 'summary']
 */
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summary: ['dashboard', 'summary'] as const,
};

/**
 * Query options for dashboard summary
 *
 * Fetches comprehensive dashboard analytics including:
 * - Total votes casted
 * - Active voting polls
 * - Rewards earned
 * - User-specific statistics
 */
export const dashboardSummaryQueryOptions = queryOptions({
  queryKey: dashboardQueryKeys.summary,
  queryFn: () => dashboardService.getDashboardSummary(),
  refetchOnWindowFocus: true,
  refetchOnMount: true,
});
