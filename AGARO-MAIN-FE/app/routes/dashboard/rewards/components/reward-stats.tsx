/**
 * Rewards Stats
 *
 * Three-column stats overview showing claimable, pending, and claimed rewards
 * Features animated number countups using Framer Motion
 */
import { formatEther } from 'viem';
import CountUp from '~/components/CountUp';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import { useWalletBalance } from '~/hooks/use-web3';
import { cn } from '~/lib/utils';

import { useRewardDashboardSummary } from '../hooks/use-reward-dashboard-summary';
import { useSyntheticRewardsEarned } from '../hooks/use-synthetic-rewards-earned';

function RewardStatsGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode;
  columns: number;
  className?: string;
}) {
  return <div className={cn(`grid gap-4 md:grid-cols-${columns}`, className)}>{children}</div>;
}

function RewardStatsCard({
  children,
  title,
  icon,
}: {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <Card key={title}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ClaimableRewardsStatsCardContent() {
  const { symbol, isLoading: isLoadingSymbol } = useWalletBalance();
  const { data: rewardDashboardSummary } = useRewardDashboardSummary();

  const { isLoading: isLoadingClaimableRewards, formattedTotalEarned } = useSyntheticRewardsEarned({
    syntheticAddresses: rewardDashboardSummary?.syntheticClaimablePlucks || [],
    enabled: !!rewardDashboardSummary?.syntheticClaimablePlucks?.length,
  });

  const isLoading = isLoadingSymbol || !symbol || isLoadingClaimableRewards;
  const amount = Number(formattedTotalEarned) || 0;

  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold">
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <CountUp
              to={amount}
              from={0}
              duration={1.5}
              separator=","
              className="tabular-nums"
              startWhen={!isLoading}
            />{' '}
            <span className="text-muted-foreground">{symbol}</span>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        From{' '}
        <CountUp
          to={rewardDashboardSummary?.totalClaimableFromPolls || 0}
          from={0}
          duration={1}
          className="inline-block tabular-nums"
          startWhen={!!rewardDashboardSummary}
        />{' '}
        polls
      </p>
    </div>
  );
}

function PendingRewardsStatsCardContent() {
  const { symbol, isLoading: isLoadingSymbol } = useWalletBalance();
  const { data: rewardDashboardSummary } = useRewardDashboardSummary();

  const { isLoading: isLoadingPendingRewards, formattedTotalEarned } = useSyntheticRewardsEarned({
    syntheticAddresses: rewardDashboardSummary?.syntheticPendingPlucks || [],
    enabled: !!rewardDashboardSummary?.syntheticPendingPlucks?.length,
  });

  const isLoading = isLoadingSymbol || !symbol || isLoadingPendingRewards;
  const amount = Number(formattedTotalEarned) || 0;

  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold">
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <CountUp
              to={amount}
              from={0}
              duration={1.5}
              delay={0.2}
              separator=","
              className="tabular-nums"
              startWhen={!isLoading}
            />{' '}
            <span className="text-muted-foreground">{symbol}</span>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        From{' '}
        <CountUp
          to={rewardDashboardSummary?.totalPendingFromPolls || 0}
          from={0}
          duration={1}
          delay={0.2}
          className="inline-block tabular-nums"
          startWhen={!!rewardDashboardSummary}
        />{' '}
        polls
      </p>
    </div>
  );
}

function ClaimedRewardsStatsCardContent() {
  const { symbol, isLoading: isLoadingSymbol } = useWalletBalance();
  const { data: rewardDashboardSummary, isLoading: isLoadingRewardDashboardSummary } =
    useRewardDashboardSummary();

  const isLoading = isLoadingSymbol || !symbol || isLoadingRewardDashboardSummary;
  const amount = rewardDashboardSummary?.totalClaimedAmount || 0;

  const formattedAmount = amount ? parseInt(formatEther(BigInt(amount)).toString()) : 0;

  return (
    <div className="space-y-1">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          From{' '}
          <CountUp
            to={rewardDashboardSummary?.totalClaimedFromPolls || 0}
            from={0}
            duration={1}
            delay={0.4}
            className="inline-block tabular-nums"
            startWhen={!!rewardDashboardSummary}
          />{' '}
          polls
        </p>

        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <p className="text-4xl font-bold">
            <CountUp
              to={formattedAmount}
              from={0}
              duration={1.5}
              delay={0.4}
              separator=","
              className="tabular-nums"
              startWhen={!isLoading}
            />{' '}
            <span className="text-muted-foreground">{symbol}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export const RewardStats = {
  Grid: RewardStatsGrid,
  Card: RewardStatsCard,
  ClaimableCardContent: ClaimableRewardsStatsCardContent,
  PendingCardContent: PendingRewardsStatsCardContent,
  ClaimedCardContent: ClaimedRewardsStatsCardContent,
};
