/**
 * Rewards Summary Card
 *
 * Hero section displaying total claimable rewards with claim action
 */
import { Gem, History, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

import { useTabsQueryState } from '../hooks/use-tabs-query-state';
import { mockRewardsSummary } from './mock-data';

export function RewardsSummaryCard() {
  const summary = mockRewardsSummary;

  const [__, setActiveTab] = useTabsQueryState();

  const handleViewHistory = () => {
    setActiveTab('history');
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gem className="h-6 w-6 text-primary" />
          <CardTitle>Your Rewards</CardTitle>
        </div>
        <CardDescription>Total rewards available from ended voting polls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Amount */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Available to Claim</p>
          <div className="space-y-1">
            <p className="text-4xl font-bold">{summary.totalClaimable} AGR</p>
            <p className="text-lg text-muted-foreground">≈ ${summary.totalClaimableUsd} USD</p>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Lifetime Earned</p>
            <p className="font-semibold">{summary.lifetimeEarned} AGR</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Claimed</p>
            <p className="font-semibold">{summary.totalClaimed} AGR</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleViewHistory} size="lg" variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
