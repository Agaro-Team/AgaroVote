/**
 * Claim History List
 *
 * List of previously claimed rewards
 */
import { AlertCircle, ExternalLink, Gift, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatEther } from 'viem';
import { Button } from '~/components/ui/button';
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

import { ClaimAmount, ClaimedAmount } from './claim-amount';
import { Reward } from './reward';

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
        <Reward key={reward.id} reward={reward}>
          <Reward.Card className="opacity-75 hover:opacity-100 transition-opacity">
            <Reward.Header>
              <Reward.HeaderContainer>
                <Reward.TitleContainer>
                  <Reward.TitleGroup>
                    <Reward.Title emoji="✅" />
                    <Reward.StatusBadge status="claimed" />
                  </Reward.TitleGroup>
                  <Reward.Description>
                    Claimed on{' '}
                    <ClientDate
                      date={new Date(reward.claimed_at!)}
                      formatString="MMM dd, yyyy HH:mm"
                    />
                  </Reward.Description>
                </Reward.TitleContainer>
              </Reward.HeaderContainer>
            </Reward.Header>

            <Reward.Content>
              {/* Claim Info */}
              <Reward.InfoGrid>
                <Reward.InfoRow label="Your Vote:" value={`${reward.choice_name} ✓`} />
                <Reward.VotedDate />
                <Reward.InfoRow
                  label="Poll Ended:"
                  value={
                    <ClientDate
                      date={new Date(reward.claimable_at)}
                      formatString="MMM dd, yyyy HH:mm"
                    />
                  }
                  suppressHydrationWarning
                />
                <Reward.TotalVotes />
              </Reward.InfoGrid>

              {/* Claimed Amount */}
              <Reward.AmountBox className="bg-green-500/10 border border-green-500/20">
                <Reward.AmountRow>
                  <Reward.AmountLabel emoji="💰">Reward:</Reward.AmountLabel>
                  <Reward.AmountValue>
                    <ClaimedAmount
                      reward={reward}
                      className="text-xl font-bold text-green-700 dark:text-green-300"
                    />
                    <p className="text-sm text-muted-foreground">
                      Principal Amount: {formatEther(BigInt(reward.principal_amount))}
                    </p>
                  </Reward.AmountValue>
                </Reward.AmountRow>
              </Reward.AmountBox>

              {/* Actions */}
              <Reward.Actions>
                <Button
                  onClick={() => handleViewPoll(reward.poll_id)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Poll
                </Button>
              </Reward.Actions>
            </Reward.Content>
          </Reward.Card>
        </Reward>
      ))}

      {rewardsQuery.hasNextPage && (
        <Button variant="outline" onClick={() => rewardsQuery.fetchNextPage()}>
          Load More History
        </Button>
      )}
    </div>
  );
}
