/**
 * Rewards Page
 *
 * Page for viewing and claiming rewards from ended voting polls.
 * Protected by SIWE authentication middleware.
 */
import { Check, Clock, Gem } from 'lucide-react';
import { useSearchParams } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { siweAuthMiddleware } from '~/lib/middleware/auth';

import { Suspense, useEffect, useRef } from 'react';

import { RewardStats } from './components';
import { ClaimHistoryList } from './components/claim-history-list';
import { ClaimableRewardsList } from './components/claimable-rewards-list';
import { PendingRewardsList } from './components/pending-rewards-list';
import { RewardSkeletonList } from './components/reward-skeleton-list';
import { RewardsSummary } from './components/reward-summary';
import { RewardsTabs } from './components/rewards-tabs';
import { useTabsQueryState } from './hooks/use-tabs-query-state';

/**
 * Apply SIWE authentication middleware
 * Ensures user is authenticated before accessing this route
 */
export const middleware = [siweAuthMiddleware];

export default function RewardsPage() {
  const [searchParams] = useSearchParams();
  const tabsRef = useRef<HTMLDivElement>(null);

  const [__, setActiveTab] = useTabsQueryState();

  const handleViewHistory = () => {
    setActiveTab('history');
  };

  // Scroll to tabs section when activeTab query param is present
  useEffect(() => {
    const activeTab = searchParams.get('activeTab');

    if (activeTab && tabsRef.current) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        tabsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">AgaroVote</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Rewards</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Rewards Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your voting rewards. Claim rewards from ended polls and track pending rewards
            from active polls.
          </p>
        </div>

        {/* Summary Card */}
        <RewardsSummary.Root>
          <RewardsSummary.Header
            icon={<Gem className="h-6 w-6 text-primary" />}
            title="Your Rewards"
          />
          <RewardsSummary.Content>
            <RewardsSummary.BalanceNow />
          </RewardsSummary.Content>
        </RewardsSummary.Root>

        {/* Stats Grid */}
        <RewardStats.Grid>
          <RewardStats.Card title="Claimable" icon={<Gem className="h-4 w-4 text-primary" />}>
            <RewardStats.ClaimableCardContent />
          </RewardStats.Card>

          <RewardStats.Card title="Pending" icon={<Clock className="h-4 w-4 text-blue-500" />}>
            <RewardStats.PendingCardContent />
          </RewardStats.Card>

          <RewardStats.Card title="Claimed" icon={<Check className="h-4 w-4 text-green-500" />}>
            <RewardStats.ClaimedCardContent />
          </RewardStats.Card>
        </RewardStats.Grid>

        {/* Tabs - with ref for auto-scroll */}
        <div ref={tabsRef}>
          <RewardsTabs
            claimableContent={
              <Suspense fallback={<RewardSkeletonList />}>
                <ClaimableRewardsList />
              </Suspense>
            }
            pendingContent={
              <Suspense fallback={<RewardSkeletonList />}>
                <PendingRewardsList />
              </Suspense>
            }
            historyContent={<ClaimHistoryList />}
          />
        </div>
      </div>
    </>
  );
}
