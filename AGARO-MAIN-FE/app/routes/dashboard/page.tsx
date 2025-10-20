import { fetchDashboardSummary } from '~/lib/api/dashboard/dashboard.server';
import { getAuthToken } from '~/lib/auth/auth.server';
import { dashboardQueryKeys } from '~/lib/query-client/dashboard/queries';

import { QueryClient, dehydrate } from '@tanstack/react-query';
import { HydrationBoundary } from '@tanstack/react-query';

import type { Route } from './+types/page';
import { DashboardContent } from './components/dashboard-content';

/**
 * Loader - Prefetch dashboard data on the server
 *
 * This ensures data is available immediately when the page loads,
 * improving perceived performance and SEO.
 *
 * Uses server-side fetch with auth token for security.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const queryClient = new QueryClient();

  // Get auth token from cookies
  const token = await getAuthToken(request);

  if (token) {
    try {
      // Prefetch dashboard data on the server
      await queryClient.prefetchQuery({
        queryKey: dashboardQueryKeys.summary,
        queryFn: () => fetchDashboardSummary(token),
      });
    } catch (error) {
      // If prefetch fails, let the client handle it
      console.error('Failed to prefetch dashboard data:', error);
    }
  }

  // Dehydrate the query cache to pass to the client
  return {
    dehydratedState: dehydrate(queryClient),
  };
};

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  return (
    <HydrationBoundary state={loaderData.dehydratedState}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
