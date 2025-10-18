/**
 * Claimable Rewards List
 *
 * List of rewards from ended polls that are ready to claim
 */
import { ExternalLink, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ClientDate } from '~/components/ui/client-date';

import { mockClaimableRewards } from './mock-data';

export function ClaimableRewardsList() {
  const rewards = mockClaimableRewards;

  const handleClaim = (pollTitle: string, amount: string) => {
    toast.success('Claiming reward...', {
      description: `Claiming ${amount} AGR from "${pollTitle}"`,
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
          <p className="text-muted-foreground">No claimable rewards at the moment.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Vote in active polls to earn rewards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rewards.length} reward{rewards.length !== 1 ? 's' : ''} ready to claim
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
                    ✅ Ended
                  </Badge>
                </div>
                <CardDescription suppressHydrationWarning>
                  Ended <ClientDate date={reward.pollEndTime} formatString="MMM dd, yyyy HH:mm" /> (
                  <ClientDate date={reward.pollEndTime} formatString="EEE" />)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vote Info */}
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
                <span className="text-muted-foreground">Total Votes:</span>
                <span className="font-medium">{reward.totalVotes.toLocaleString()}</span>
              </div>
            </div>

            {/* Reward Amount */}
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">💎 Reward:</span>
                <div className="text-right">
                  <p className="text-xl font-bold">{reward.rewardAmount} AGR</p>
                  <p className="text-sm text-muted-foreground">≈ ${reward.rewardAmountUsd}</p>
                </div>
              </div>
              {(reward.earlyVoterBonus || reward.participationBonus) && (
                <div className="pt-2 border-t">
                  {reward.earlyVoterBonus && (
                    <p className="text-xs text-muted-foreground">
                      🏆 Early Voter Bonus: +{reward.earlyVoterBonus}%
                    </p>
                  )}
                  {reward.participationBonus && (
                    <p className="text-xs text-muted-foreground">
                      🎯 Participation Bonus: +{reward.participationBonus}%
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleClaim(reward.pollTitle, reward.rewardAmount)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Claim Now
              </Button>
              <Button
                onClick={() => handleViewPoll(reward.pollId)}
                variant="outline"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Poll
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
