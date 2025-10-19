/**
 * Claimable Rewards List
 *
 * List of rewards from ended polls that are ready to claim
 */
import { AlertCircle, ExternalLink, Gift, Info, RefreshCw, Sparkles } from 'lucide-react';
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
import { ClaimRewardConfirmationModal } from './claim-confirmation-modal';
import { Reward } from './reward';

export function ClaimableRewardsList() {
  const rewardsQuery = useSuspenseInfiniteQuery(
    infiniteRewardListQueryOptions({ claimableOnly: true })
  );

  const handleViewPoll = (pollId: string) => {
    toast.info('Redirecting to poll...', {
      description: `Viewing poll #${pollId}`,
    });
  };

  const handleRetry = () => {
    rewardsQuery.refetch();
    toast.info('Retrying...', {
      description: 'Refreshing claimable rewards list',
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
          <EmptyTitle>Failed to Load Claimable Rewards</EmptyTitle>
          <EmptyDescription>
            {rewardsQuery.error instanceof Error
              ? rewardsQuery.error.message
              : 'Unable to fetch your claimable rewards. Please check your connection and try again.'}
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
          <EmptyTitle>No Claimable Rewards</EmptyTitle>
          <EmptyDescription>
            You don't have any rewards ready to claim. Vote in active polls to earn rewards!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {/* {rewardsQuery.data?.rewards?.length} reward
          {rewardsQuery.data?.rewards?.length !== 1 ? 's' : ''} ready to claim */}
        </p>
      </div>

      {rewardsQuery.data?.rewards?.map((reward) => (
        <Reward key={reward.id} reward={reward}>
          <Reward.Card>
            <Reward.Header>
              <Reward.HeaderContainer>
                <Reward.TitleContainer>
                  <Reward.TitleGroup>
                    <Reward.Title />
                    <Reward.StatusBadge status="claimable" />
                  </Reward.TitleGroup>
                  <Reward.Description>
                    Ended <Reward.ClaimableDate label="" formatString="MMM dd, yyyy HH:mm" />
                  </Reward.Description>
                </Reward.TitleContainer>
              </Reward.HeaderContainer>
            </Reward.Header>

            <Reward.Content>
              {/* Vote Info */}
              <Reward.InfoGrid>
                <Reward.InfoRow label="Your Vote:" value={`${reward.choice_name} ✓`} />
                <Reward.VotedDate />
                <Reward.TotalVotes />
              </Reward.InfoGrid>

              {/* Reward Amount - Highlighted for claimable */}
              <Reward.AmountBox className="bg-green-500/10 border border-green-500/20">
                <Reward.AmountRow>
                  <Reward.AmountLabel emoji="💎">Reward:</Reward.AmountLabel>
                  <Reward.AmountValue>
                    <ClaimAmount
                      reward={reward}
                      className="text-xl font-bold text-green-700 dark:text-green-300"
                    />
                    <p className="text-sm text-muted-foreground">
                      Principal Amount: {reward.principal_amount}
                    </p>
                  </Reward.AmountValue>
                </Reward.AmountRow>
              </Reward.AmountBox>

              {/* Success Alert */}
              <Reward.Alert variant="success">
                ✅ Your reward is ready! Claim now to receive your tokens.
              </Reward.Alert>

              {/* Actions */}
              <Reward.Actions>
                <ClaimRewardConfirmationModal reward={reward}>
                  <Button className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Claim Now
                  </Button>
                </ClaimRewardConfirmationModal>
                <Button
                  onClick={() => handleViewPoll(reward.poll_id)}
                  variant="outline"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Poll
                </Button>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </Reward.Actions>
            </Reward.Content>
          </Reward.Card>
        </Reward>
      ))}

      {rewardsQuery.hasNextPage && (
        <Button variant="outline" onClick={() => rewardsQuery.fetchNextPage()}>
          Load More
        </Button>
      )}
    </div>
  );
}
