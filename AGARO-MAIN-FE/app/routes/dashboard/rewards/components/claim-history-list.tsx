/**
 * Claim History List
 *
 * List of previously claimed rewards
 */
import { AlertCircle, ExternalLink, Gift, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ClientDate } from '~/components/ui/client-date';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import { infiniteRewardListQueryOptions } from '~/lib/query-client/reward/queries';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

export function ClaimHistoryList() {
  const rewardsQuery = useSuspenseInfiniteQuery(
    infiniteRewardListQueryOptions({ claimedOnly: true })
  );

  const handleViewPoll = (pollId: string) => {
    toast.info('Redirecting to poll...', {
      description: `Viewing poll #${pollId}`,
    });
  };

  const handleRetry = () => {
    rewardsQuery.refetch();
    toast.info('Retrying...', {
      description: 'Refreshing claim history',
    });
  };

  // Error State - Detailed error message with retry
  if (rewardsQuery.error) {
    return (
      <Empty className="border border-destructive/50">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Failed to Load Claim History</EmptyTitle>
          <EmptyDescription>
            {rewardsQuery.error instanceof Error
              ? rewardsQuery.error.message
              : 'Unable to fetch your claim history. Please check your connection and try again.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={rewardsQuery.isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${rewardsQuery.isRefetching ? 'animate-spin' : ''}`} />
            {rewardsQuery.isRefetching ? 'Retrying...' : 'Try Again'}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Empty State - Enhanced with icon
  if (rewardsQuery.data && rewardsQuery.data.total === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Gift />
          </EmptyMedia>
          <EmptyTitle>No Claim History</EmptyTitle>
          <EmptyDescription>
            You haven't claimed any rewards yet. Vote in active polls to earn rewards!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {/* Showing {rewardsQuery.data?.rewards?.length} recent claim
          {rewardsQuery.data?.rewards?.length !== 1 ? 's' : ''} */}
        </p>
      </div>

      {rewardsQuery.data?.rewards?.map((reward) => (
        <Card key={reward.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">🗳️ {reward.poll_title}</CardTitle>
                  <Badge variant="default" className="bg-green-500">
                    ✅ Claimed
                  </Badge>
                </div>
                <CardDescription suppressHydrationWarning>
                  Claimed on{' '}
                  <ClientDate
                    date={new Date(reward.claimed_at!)}
                    formatString="MMM dd, yyyy HH:mm"
                  />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Claim Info */}
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your Vote:</span>
                <span className="font-medium">{reward.choice_name} ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Voted:</span>
                <span className="font-medium" suppressHydrationWarning>
                  <ClientDate
                    date={new Date(reward.created_at)}
                    formatString="MMM dd, yyyy HH:mm"
                  />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Poll Ended:</span>
                <span className="font-medium" suppressHydrationWarning>
                  <ClientDate
                    date={new Date(reward.claimable_at)}
                    formatString="MMM dd, yyyy HH:mm"
                  />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Votes:</span>
                <span className="font-medium">{reward.poll_total_votes.toLocaleString()}</span>
              </div>
            </div>

            {/* Claimed Amount */}
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">💰 Claimed Amount:</span>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {reward.reward_amount} AGR
                  </p>
                  <p className="text-sm text-muted-foreground">≈ ${reward.reward_amount}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleViewPoll(reward.poll_id)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Poll
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {rewardsQuery.hasNextPage && (
        <Button variant="outline" onClick={() => rewardsQuery.fetchNextPage()}>
          Load More History
        </Button>
      )}
    </div>
  );
}
