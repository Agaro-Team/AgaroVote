/**
 * Rewards Summary Card - Composable Components
 *
 * Hero section displaying total claimable rewards with claim action
 * Uses composition pattern for flexible usage at page level
 *
 * @example
 * ```tsx
 * <RewardsSummary.Root>
 *   <RewardsSummary.Header
 *     icon={<Gem />}
 *     title="Your Rewards"
 *     description="Total rewards available"
 *   />
 *   <RewardsSummary.Content>
 *     <RewardsSummary.Amount amount={1000} />
 *     <RewardsSummary.Stats totalClaimed={500} />
 *     <RewardsSummary.Actions>
 *       <Button>Claim All</Button>
 *     </RewardsSummary.Actions>
 *   </RewardsSummary.Content>
 * </RewardsSummary.Root>
 * ```
 */
import { formatEther } from 'viem';
import CountUp from '~/components/CountUp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { useWalletBalance } from '~/hooks/use-web3';
import { cn } from '~/lib/utils';

import type { ReactNode } from 'react';

import { useRewardDashboardBalanceNow } from '../hooks/use-reward-dashboard-summary';

// ==================== Root Container ====================
interface RewardsSummaryRootProps {
  children: ReactNode;
  className?: string;
}

function RewardsSummaryRoot({ children, className }: RewardsSummaryRootProps) {
  return <Card className={cn('border-2', className)}>{children}</Card>;
}

// ==================== Header ====================
interface RewardsSummaryHeaderProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

function RewardsSummaryHeader({ icon, title, description, className }: RewardsSummaryHeaderProps) {
  return (
    <CardHeader className={className}>
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle>{title}</CardTitle>
      </div>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
  );
}

// ==================== Content Container ====================
interface RewardsSummaryContentProps {
  children: ReactNode;
  className?: string;
}

function RewardsSummaryContent({ children, className }: RewardsSummaryContentProps) {
  return <CardContent className={cn('space-y-6', className)}>{children}</CardContent>;
}

// ==================== Amount Display ====================
interface RewardsSummaryAmountProps {
  label?: string;
  className?: string;
}

function RewardsBalanceNow({ label = 'Your Balance Now', className }: RewardsSummaryAmountProps) {
  const { symbol } = useWalletBalance();

  const { rawBalance, isLoading: isBalanceLoading } = useRewardDashboardBalanceNow();

  const isLoading = isBalanceLoading;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {isLoading ? (
          <Skeleton className="h-12 w-40" />
        ) : (
          <p className="text-4xl font-bold">
            <CountUp
              to={Number(Number(formatEther(rawBalance)).toFixed(2))}
              from={0}
              duration={0.5}
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

// ==================== Stats Display ====================
interface RewardsSummaryStatsProps {
  totalClaimed?: number | string;
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
}

function RewardsSummaryStats({
  totalClaimed,
  isLoading: isLoadingProp,
  className,
  children,
}: RewardsSummaryStatsProps) {
  const { symbol, isLoading: isBalanceLoading } = useWalletBalance();
  const isLoading = isLoadingProp ?? isBalanceLoading;

  if (children) {
    return <div className={cn('flex items-center gap-6 text-sm', className)}>{children}</div>;
  }

  return (
    <div className={cn('flex items-center gap-6 text-sm', className)}>
      <div>
        <p className="text-muted-foreground">Total Claimed</p>
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="font-semibold">
            {totalClaimed} {symbol}
          </p>
        )}
      </div>
    </div>
  );
}

// ==================== Stat Item (for custom stats) ====================
interface RewardsSummaryStatItemProps {
  label: string;
  value: ReactNode;
  isLoading?: boolean;
  className?: string;
}

function RewardsSummaryStatItem({
  label,
  value,
  isLoading,
  className,
}: RewardsSummaryStatItemProps) {
  return (
    <div className={className}>
      <p className="text-muted-foreground">{label}</p>
      {isLoading ? <Skeleton className="h-8 w-32" /> : <p className="font-semibold">{value}</p>}
    </div>
  );
}

// ==================== Actions Container ====================
interface RewardsSummaryActionsProps {
  children: ReactNode;
  className?: string;
}

function RewardsSummaryActions({ children, className }: RewardsSummaryActionsProps) {
  return <div className={cn('flex flex-wrap gap-3', className)}>{children}</div>;
}

// ==================== Composed Export ====================
export const RewardsSummary = {
  Root: RewardsSummaryRoot,
  Header: RewardsSummaryHeader,
  Content: RewardsSummaryContent,
  BalanceNow: RewardsBalanceNow,
  Stats: RewardsSummaryStats,
  StatItem: RewardsSummaryStatItem,
  Actions: RewardsSummaryActions,
};
