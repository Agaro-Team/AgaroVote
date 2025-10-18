/**
 * Pending Rewards List
 *
 * List of rewards from active polls (locked until poll ends)
 */
import { Bell, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ClientDate } from '~/components/ui/client-date';

import { useEffect, useState } from 'react';

import { formatTimeRemaining, getPollProgress, mockPendingRewards } from './mock-data';

export function PendingRewardsList() {
  const rewards = mockPendingRewards;
  const [, setTick] = useState(0);

  // Update countdown every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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

  if (rewards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No pending rewards.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your rewards from active polls will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm">
        <p className="text-blue-700 dark:text-blue-300">
          ℹ️ These rewards are from ongoing polls. They will become claimable once the polls end.
        </p>
      </div>

      {rewards.map((reward) => {
        const timeRemaining = formatTimeRemaining(reward.pollEndTime);
        const progress = getPollProgress(reward.voteTimestamp, reward.pollEndTime);

        return (
          <Card key={reward.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">🗳️ {reward.pollTitle}</CardTitle>
                    <Badge variant="secondary" className="bg-blue-500 text-white">
                      🔵 Active
                    </Badge>
                  </div>
                  <CardDescription>Your vote: {reward.userVote} ✓</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Countdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ends in:</span>
                  </div>
                  <span className="font-bold">{timeRemaining}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                  Ends: <ClientDate date={reward.pollEndTime} formatString="MMM dd, yyyy HH:mm" />
                </p>
              </div>

              {/* Vote Info */}
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Voted:</span>
                  <span className="font-medium" suppressHydrationWarning>
                    <ClientDate date={reward.voteTimestamp} formatString="MMM dd, yyyy HH:mm" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Votes:</span>
                  <span className="font-medium">{reward.totalVotes.toLocaleString()}</span>
                </div>
              </div>

              {/* Potential Reward */}
              <div className="rounded-lg bg-muted p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">💎 Potential Reward:</span>
                  <div className="text-right">
                    <p className="text-xl font-bold">~{reward.rewardAmount} AGR</p>
                    <p className="text-sm text-muted-foreground">≈ ${reward.rewardAmountUsd}</p>
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
                  onClick={() => handleViewPoll(reward.pollId)}
                  variant="outline"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Poll
                </Button>
                <Button
                  onClick={() => handleSetReminder(reward.pollTitle)}
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
    </div>
  );
}
