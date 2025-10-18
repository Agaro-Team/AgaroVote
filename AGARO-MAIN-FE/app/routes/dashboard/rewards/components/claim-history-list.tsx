/**
 * Claim History List
 *
 * List of previously claimed rewards
 */
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ClientDate } from '~/components/ui/client-date';

import { mockClaimedRewards } from './mock-data';

export function ClaimHistoryList() {
  const rewards = mockClaimedRewards;

  const handleViewTransaction = (txHash: string) => {
    toast.info('Opening block explorer...', {
      description: `Viewing transaction ${txHash.slice(0, 10)}...`,
    });
  };

  const handleViewPoll = (pollId: string) => {
    toast.info('Redirecting to poll...', {
      description: `Viewing poll #${pollId}`,
    });
  };

  if (rewards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No claim history yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your claimed rewards will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {rewards.length} recent claim{rewards.length !== 1 ? 's' : ''}
        </p>
      </div>

      {rewards.map((reward) => (
        <Card key={reward.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">🗳️ {reward.pollTitle}</CardTitle>
                  <Badge variant="default" className="bg-green-500">
                    ✅ Claimed
                  </Badge>
                </div>
                <CardDescription suppressHydrationWarning>
                  Claimed on{' '}
                  <ClientDate date={reward.claimedAt!} formatString="MMM dd, yyyy HH:mm" />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Claim Info */}
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your Vote:</span>
                <span className="font-medium">{reward.userVote} ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Voted:</span>
                <span className="font-medium" suppressHydrationWarning>
                  <ClientDate date={reward.voteTimestamp} formatString="MMM dd, yyyy HH:mm" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Poll Ended:</span>
                <span className="font-medium" suppressHydrationWarning>
                  <ClientDate date={reward.pollEndTime} formatString="MMM dd, yyyy HH:mm" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Votes:</span>
                <span className="font-medium">{reward.totalVotes.toLocaleString()}</span>
              </div>
            </div>

            {/* Claimed Amount */}
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">💰 Claimed Amount:</span>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {reward.rewardAmount} AGR
                  </p>
                  <p className="text-sm text-muted-foreground">≈ ${reward.rewardAmountUsd}</p>
                </div>
              </div>
              {reward.earlyVoterBonus && (
                <div className="pt-2 border-t border-green-500/20">
                  <p className="text-xs text-muted-foreground">
                    🏆 Included Early Voter Bonus: +{reward.earlyVoterBonus}%
                  </p>
                </div>
              )}
            </div>

            {/* Transaction Hash */}
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Transaction Hash:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs flex-1 overflow-hidden text-ellipsis">
                  {reward.claimTxHash}
                </code>
                <Button
                  onClick={() => handleViewTransaction(reward.claimTxHash!)}
                  variant="ghost"
                  size="sm"
                  className="gap-1 h-7 text-xs"
                >
                  <ExternalLink className="h-3 w-3" />
                  View
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleViewPoll(reward.pollId)}
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

      {/* Load More (Placeholder) */}
      <div className="text-center pt-4">
        <Button variant="outline">Load More History</Button>
      </div>
    </div>
  );
}
