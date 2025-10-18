/**
 * Rewards Stats Grid
 *
 * Three-column stats overview showing claimable, pending, and claimed rewards
 */
import { Check, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

import { mockRewardsSummary } from './mock-data';

export function RewardsStatsGrid() {
  const summary = mockRewardsSummary;

  const stats = [
    {
      title: 'Claimable',
      icon: DollarSign,
      amount: `${summary.totalClaimable} AGR`,
      usd: `≈ $${summary.totalClaimableUsd}`,
      count: `From ${summary.claimableCount} polls`,
      status: '✅ Poll ended',
      color: 'text-green-500',
    },
    {
      title: 'Pending',
      icon: Clock,
      amount: `${summary.totalPending} AGR`,
      usd: `≈ $${summary.totalPendingUsd}`,
      count: `From ${summary.pendingCount} polls`,
      status: '🔵 Ongoing',
      color: 'text-blue-500',
    },
    {
      title: 'Claimed',
      icon: Check,
      amount: `${summary.totalClaimed} AGR`,
      usd: `≈ $${summary.totalClaimedUsd}`,
      count: `From ${summary.claimedCount} polls`,
      status: '💰 In wallet',
      color: 'text-primary',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stat.amount}</div>
              <p className="text-sm text-muted-foreground">{stat.usd}</p>
              <p className="text-xs text-muted-foreground">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.status}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
