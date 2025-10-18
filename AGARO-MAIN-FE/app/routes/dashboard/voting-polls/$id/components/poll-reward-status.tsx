/**
 * Poll Reward Status Component
 *
 * Shows reward status for a specific poll
 * - Active polls: Show potential reward (locked)
 * - Ended polls: Show claimable reward or claimed status
 * - Not voted: Show no reward message
 */
import { Bell, ExternalLink, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ClientDate } from '~/components/ui/client-date';

interface PollRewardStatusProps {
  pollId: string;
  pollStatus: 'active' | 'ended';
  pollEndTime: Date;
  hasVoted: boolean;
  userVote?: string;
  voteTimestamp?: Date;
  rewardAmount?: string;
  rewardStatus?: 'locked' | 'claimable' | 'claimed' | 'none';
  claimedAt?: Date;
  claimTxHash?: string;
}

export function PollRewardStatus({
  pollId,
  pollStatus,
  pollEndTime,
  hasVoted,
  userVote,
  voteTimestamp,
  rewardAmount = '45.67',
  rewardStatus = 'locked',
  claimedAt,
  claimTxHash,
}: PollRewardStatusProps) {
  const handleClaim = () => {
    toast.success('Claiming reward...', {
      description: `Claiming ${rewardAmount} AGR`,
    });
  };

  const handleSetReminder = () => {
    toast.success('Reminder set!', {
      description: "We'll notify you when this reward is claimable.",
    });
  };

  const handleViewAllRewards = () => {
    window.location.href = '/dashboard/rewards';
  };

  const handleViewTransaction = () => {
    toast.info('Opening block explorer...', {
      description: `Viewing transaction ${claimTxHash?.slice(0, 10)}...`,
    });
  };

  // User didn't vote
  if (!hasVoted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Reward Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4 text-center space-y-2">
            <p className="text-muted-foreground">ℹ️ No Reward Available</p>
            <p className="text-sm text-muted-foreground">You didn't participate in this poll</p>
            <p className="text-xs text-muted-foreground mt-4">
              💡 Vote in active polls to earn rewards!
            </p>
            <Button onClick={handleViewAllRewards} variant="outline" size="sm" className="mt-4">
              View Active Polls →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User voted - Active poll (reward locked)
  if (pollStatus === 'active') {
    const timeRemaining = pollEndTime.getTime() - Date.now();
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💎 Your Reward Status
            <Badge variant="secondary" className="bg-blue-500 text-white">
              🔵 Locked
            </Badge>
          </CardTitle>
          <CardDescription>Poll is still active</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vote Info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Vote Recorded</p>
                <p className="text-sm text-muted-foreground">You voted: {userVote}</p>
              </div>
            </div>
            {voteTimestamp && (
              <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                Voted on: <ClientDate date={voteTimestamp} formatString="MMM dd, yyyy HH:mm" />
              </p>
            )}
          </div>

          {/* Countdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">⏰ Poll Ends:</span>
              <span className="font-bold">
                {days > 0 && `${days}d `}
                {hours > 0 && `${hours}h `}
                {minutes}m
              </span>
            </div>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              <ClientDate date={pollEndTime} formatString="MMM dd, yyyy HH:mm" />
            </p>
          </div>

          {/* Potential Reward */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">💰 Potential Reward:</span>
              <div className="text-right">
                <p className="text-xl font-bold">~{rewardAmount} AGR</p>
                <p className="text-sm text-muted-foreground">
                  ≈ ${(parseFloat(rewardAmount) * 1.5).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ Reward will be claimable after poll ends
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSetReminder} variant="outline" className="gap-2">
              <Bell className="h-4 w-4" />
              Notify Me
            </Button>
            <Button onClick={handleViewAllRewards} variant="outline" className="gap-2">
              View All Rewards →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User voted - Poll ended - Already claimed
  if (rewardStatus === 'claimed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✅ Reward Claimed
            <Badge variant="default" className="bg-green-500">
              Claimed
            </Badge>
          </CardTitle>
          <CardDescription>Your reward has been claimed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Claimed Amount */}
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">💰 Claimed:</span>
              <div className="text-right">
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {rewardAmount} AGR
                </p>
                <p className="text-sm text-muted-foreground">
                  ≈ ${(parseFloat(rewardAmount) * 1.5).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {claimedAt && (
            <div className="text-sm text-muted-foreground" suppressHydrationWarning>
              <p>
                Claimed on: <ClientDate date={claimedAt} formatString="MMM dd, yyyy HH:mm" />
              </p>
            </div>
          )}

          {/* Transaction Hash */}
          {claimTxHash && (
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Transaction Hash:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs flex-1 overflow-hidden text-ellipsis">{claimTxHash}</code>
                <Button
                  onClick={handleViewTransaction}
                  variant="ghost"
                  size="sm"
                  className="gap-1 h-7 text-xs"
                >
                  <ExternalLink className="h-3 w-3" />
                  View
                </Button>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Thank you for participating! 🎉</p>
          </div>

          {/* Actions */}
          <Button onClick={handleViewAllRewards} variant="outline" className="w-full">
            View All Rewards →
          </Button>
        </CardContent>
      </Card>
    );
  }

  // User voted - Poll ended - Claimable
  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💎 Your Reward is Ready!
          <Badge variant="default" className="bg-green-500">
            ✅ Claimable
          </Badge>
        </CardTitle>
        <CardDescription>This poll has ended and your reward is ready to claim</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poll Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">✅ Poll Ended:</span>
            <span className="font-medium" suppressHydrationWarning>
              <ClientDate date={pollEndTime} formatString="MMM dd, yyyy HH:mm" />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your vote:</span>
            <span className="font-medium">{userVote} ✓</span>
          </div>
        </div>

        {/* Reward Amount */}
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">🎉</p>
            <p className="text-sm text-muted-foreground mb-1">Reward Available!</p>
            <p className="text-3xl font-bold">{rewardAmount} AGR</p>
            <p className="text-sm text-muted-foreground">
              ≈ ${(parseFloat(rewardAmount) * 1.5).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Gas Fee */}
        <div className="rounded-lg bg-muted p-3 text-sm text-center">
          <p className="text-muted-foreground">Gas estimate: ~0.0023 ETH (~$5.50)</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={handleClaim} size="lg" className="gap-2 w-full">
            <Sparkles className="h-4 w-4" />
            Claim Now
          </Button>
          <Button onClick={handleViewAllRewards} variant="outline" className="w-full">
            View All Rewards
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
