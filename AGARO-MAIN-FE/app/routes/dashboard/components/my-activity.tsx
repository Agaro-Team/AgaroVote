/**
 * My Activity Component
 *
 * Displays user's voting activity and claimable rewards
 */
import { CheckCircle2, Coins, Vote } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Spinner } from '~/components/ui/spinner';
import { dashboardSummaryQueryOptions } from '~/lib/query-client/dashboard/queries';
import { Link } from '~/lib/utils/navigation';

import { useQuery } from '@tanstack/react-query';

import { MyActivitySkeleton } from './dashboard-loading';

export function MyActivity() {
  const { data, isLoading, isFetching } = useQuery(dashboardSummaryQueryOptions);

  if (isLoading) {
    return (
      <Card className="col-span-3 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">My Voting Activity</h3>
          <p className="text-sm text-muted-foreground">Loading your activity...</p>
        </div>
        <MyActivitySkeleton />
      </Card>
    );
  }

  if (!data?.data) {
    return null;
  }

  const summary = data.data;

  return (
    <Card className="col-span-3 p-6 relative">
      {/* Loading overlay for refetch */}
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10 animate-in fade-in duration-200">
          <Spinner />
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold">My Voting Activity</h3>
        <p className="text-sm text-muted-foreground">Your participation overview</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm">Total Votes Cast</span>
          </div>
          <span className="text-sm font-bold">{summary.my_total_vote_casted}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-primary" />
            <span className="text-sm">Pending Vote Claims</span>
          </div>
          <span className="text-sm font-bold">{summary.my_total_pending_vote_claims}</span>
        </div>
        <Separator />
        <div className="pt-2">
          <Link
            to="/dashboard/rewards"
            className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Coins className="mr-2 h-4 w-4" />
            View My Rewards
          </Link>
        </div>
      </div>
    </Card>
  );
}
