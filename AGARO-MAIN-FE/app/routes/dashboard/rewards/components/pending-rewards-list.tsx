/**
 * Pending Rewards List
 *
 * List of rewards from active polls (locked until poll ends)
 */
import { AlertCircle, Bell, Clock, ExternalLink, Inbox, RefreshCw } from 'lucide-react';
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
import { Skeleton } from '~/components/ui/skeleton';
import { infiniteRewardListQueryOptions } from '~/lib/query-client/reward/queries';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { RewardSkeletonList } from './reward-skeleton-list';

export function PendingRewardsList() {
  const {
    data: pendingRewards,
    isLoading,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(infiniteRewardListQueryOptions({}));

  const handleSetReminder = (pollTitle: string) => {
    toast.success('Reminder set!', {
      description: `We'll notify you when "${pollTitle}" ends and your reward is claimable.`,
    });
  };

  const handleViewPoll = (pollId: string) => {
    toast.info('Redirecting to poll...', {
      description: `Viewing poll #${pollId}`,
    });
  };

  const handleRetry = () => {
    refetch();
    toast.info('Retrying...', {
      description: 'Refreshing pending rewards list',
    });
  };

  // Error State - Detailed error message with retry
  if (error) {
    return (
      <Empty className="border border-destructive/50">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Failed to Load Pending Rewards</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error
              ? error.message
              : 'Unable to fetch your pending rewards. Please check your connection and try again.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Retrying...' : 'Try Again'}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Empty State - Enhanced with icon
  if (pendingRewards && pendingRewards.rewards.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>No Pending Rewards</EmptyTitle>
          <EmptyDescription>
            Your rewards from active polls will appear here. Vote in ongoing polls to earn rewards!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Success State - Display rewards
  const rewards = pendingRewards.rewards || [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm">
        <p className="text-blue-700 dark:text-blue-300">
          ℹ️ These rewards are from ongoing polls. They will become claimable once the polls end.
        </p>
      </div>

      {rewards.map((reward) => {
        const claimableDate = new Date(reward.claimable_at);
        const votedDate = new Date(reward.created_at);
        const now = Date.now();
        const timeUntilClaimable = claimableDate.getTime() - now;

        // Calculate time remaining
        const days = Math.max(0, Math.floor(timeUntilClaimable / (1000 * 60 * 60 * 24)));
        const hours = Math.max(
          0,
          Math.floor((timeUntilClaimable % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        );
        const minutes = Math.max(
          0,
          Math.floor((timeUntilClaimable % (1000 * 60 * 60)) / (1000 * 60))
        );

        const timeRemaining =
          days > 0
            ? `${days}d ${hours}h ${minutes}m`
            : hours > 0
              ? `${hours}h ${minutes}m`
              : `${minutes}m`;

        return (
          <Card key={reward.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">🗳️ {reward.poll_title}</CardTitle>
                    <Badge variant="secondary" className="bg-blue-500 text-white">
                      🔵 Active
                    </Badge>
                  </div>
                  <CardDescription>Your vote: {reward.choice_name} ✓</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Countdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Claimable in:</span>
                  </div>
                  <span className="font-bold">{timeRemaining}</span>
                </div>
                <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                  Claimable at:{' '}
                  <ClientDate date={claimableDate} formatString="MMM dd, yyyy HH:mm" />
                </p>
              </div>

              {/* Vote Info */}
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Voted:</span>
                  <span className="font-medium" suppressHydrationWarning>
                    <ClientDate date={votedDate} formatString="MMM dd, yyyy HH:mm" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Votes:</span>
                  <span className="font-medium">{reward.poll_total_votes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Your Choice Votes:</span>
                  <span className="font-medium">{reward.choice_total_votes.toLocaleString()}</span>
                </div>
              </div>

              {/* Potential Reward */}
              <div className="rounded-lg bg-muted p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">💎 Potential Reward:</span>
                  <div className="text-right">
                    <p className="text-xl font-bold">~{reward.reward_amount} AGR</p>
                    <p className="text-sm text-muted-foreground">
                      Principal: {reward.principal_amount} AGR
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm">
                <p className="text-amber-700 dark:text-amber-300">
                  ⚠️ Reward will be claimable after poll ends
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleViewPoll(reward.poll_id)}
                  variant="outline"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Poll
                </Button>
                <Button
                  onClick={() => handleSetReminder(reward.poll_title)}
                  variant="outline"
                  className="gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Set Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {hasNextPage && (
        <Button variant="outline" onClick={() => fetchNextPage()}>
          Load More
        </Button>
      )}
    </div>
  );
}
