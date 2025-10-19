/**
 * Rewards Stats
 *
 * Three-column stats overview showing claimable, pending, and claimed rewards
 */
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import { useWalletBalance } from '~/hooks/use-web3';

function RewardStatsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-3">{children}</div>;
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

  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold">
        {isLoadingSymbol || !symbol ? <Spinner size="sm" /> : `${0} ${symbol}`}
      </div>
      <p className="text-xs text-muted-foreground">From 0 polls</p>
    </div>
  );
}

function PendingRewardsStatsCardContent() {
  const { symbol, isLoading: isLoadingSymbol } = useWalletBalance();
  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold">
        {isLoadingSymbol || !symbol ? <Spinner size="sm" /> : `${0} ${symbol}`}
      </div>
      <p className="text-xs text-muted-foreground">From 0 polls</p>
    </div>
  );
}

function ClaimedRewardsStatsCardContent() {
  const { symbol, isLoading: isLoadingSymbol } = useWalletBalance();
  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold">
        {isLoadingSymbol || !symbol ? <Spinner size="sm" /> : `${0} ${symbol}`}
      </div>
      <p className="text-xs text-muted-foreground">From 0 polls</p>
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
