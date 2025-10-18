/**
 * Rewards Page
 *
 * Page for viewing and claiming rewards from ended voting polls.
 * Protected by SIWE authentication middleware.
 */
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

import { ClaimHistoryList } from './components/claim-history-list';
import { ClaimableRewardsList } from './components/claimable-rewards-list';
import { PendingRewardsList } from './components/pending-rewards-list';
import { RewardsStatsGrid } from './components/rewards-stats-grid';
import { RewardsSummaryCard } from './components/rewards-summary-card';
import { RewardsTabs } from './components/rewards-tabs';

/**
 * Apply SIWE authentication middleware
 * Ensures user is authenticated before accessing this route
 */
export const middleware = [siweAuthMiddleware];

export default function RewardsPage() {
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
        <RewardsSummaryCard />

        {/* Stats Grid */}
        <RewardsStatsGrid />

        {/* Tabs */}
        <RewardsTabs
          claimableContent={<ClaimableRewardsList />}
          pendingContent={<PendingRewardsList />}
          historyContent={<ClaimHistoryList />}
        />
      </div>
    </>
  );
}
