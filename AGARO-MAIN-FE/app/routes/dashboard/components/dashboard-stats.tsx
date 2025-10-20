/**
 * Dashboard Stats Component
 *
 * Displays the main statistics cards at the top of the dashboard
 */
import { Coins, TrendingUp, Vote } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import { useWalletBalance } from '~/hooks/use-web3';
import { dashboardSummaryQueryOptions } from '~/lib/query-client/dashboard/queries';

import { useQuery } from '@tanstack/react-query';

import { DashboardStatsSkeleton } from './dashboard-loading';

export function DashboardStats() {
  const { data, isLoading, isFetching } = useQuery(dashboardSummaryQueryOptions);
  const walletBalance = useWalletBalance();

  if (isLoading || walletBalance.isLoading) {
    return <DashboardStatsSkeleton />;
  }

  if (!data?.data) {
    return null;
  }

  const summary = data.data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 relative">
      {/* Loading overlay for refetch */}
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10 animate-in fade-in duration-200">
          <Spinner />
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Total Votes Cast</h3>
          <Vote className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-2xl font-bold">{summary.total_vote_casted.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Active Voting Polls</h3>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-2xl font-bold">{summary.total_active_voting_polls_today}</div>
          <p className="text-xs text-muted-foreground">Available now</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Rewards Earned</h3>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-2xl font-bold">
            {summary.total_rewards_earned.toLocaleString()} {walletBalance.symbol}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>
      </Card>
    </div>
  );
}
