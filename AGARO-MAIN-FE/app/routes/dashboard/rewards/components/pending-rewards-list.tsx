/**
 * Pending Rewards List
 *
 * List of rewards from active polls (locked until poll ends)
 */
import { AlertCircle, Bell, ExternalLink, Inbox, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
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

import { ClaimAmount } from './claim-amount';
import { Reward } from './reward';

export function PendingRewardsList() {
  const {
    data: pendingRewards,
    isLoading,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    infiniteRewardListQueryOptions({
      pendingOnly: true,
    })
  );

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

      {rewards.map((reward) => (
        <Reward key={reward.id} reward={reward}>
          <Reward.Card>
            <Reward.Header>
              <Reward.HeaderContainer>
                <Reward.TitleContainer>
                  <Reward.TitleGroup>
                    <Reward.Title />
                    <Reward.StatusBadge status="active" />
                  </Reward.TitleGroup>
                  <Reward.Description />
                </Reward.TitleContainer>
              </Reward.HeaderContainer>
            </Reward.Header>

            <Reward.Content>
              {/* Countdown */}
              <Reward.Section>
                <Reward.TimeRemaining />
                <Reward.ClaimableDate />
              </Reward.Section>

              {/* Vote Info */}
              <Reward.InfoGrid>
                <Reward.VotedDate />
                <Reward.TotalVotes />
                <Reward.ChoiceVotes />
              </Reward.InfoGrid>

              {/* Potential Reward */}
              <Reward.AmountBox>
                <Reward.AmountRow>
                  <Reward.AmountLabel />
                  <Reward.AmountValue>
                    <ClaimAmount className="text-xl font-bold" reward={reward} />
                    <Reward.Principal />
                  </Reward.AmountValue>
                </Reward.AmountRow>
              </Reward.AmountBox>

              {/* Warning */}
              <Reward.Alert variant="warning">
                ⚠️ Reward will be claimable after poll ends
              </Reward.Alert>

              {/* Actions */}
              <Reward.Actions>
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
              </Reward.Actions>
            </Reward.Content>
          </Reward.Card>
        </Reward>
      ))}

      {hasNextPage && (
        <Button variant="outline" onClick={() => fetchNextPage()}>
          Load More
        </Button>
      )}
    </div>
  );
}
