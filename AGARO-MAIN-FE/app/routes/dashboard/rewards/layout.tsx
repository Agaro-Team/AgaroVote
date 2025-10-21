/**
 * Rewards Layout
 *
 * Layout for rewards section with nested tab routes.
 * Protected by SIWE authentication middleware.
 */
import { Check, Gem } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
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
import { Skeleton } from '~/components/ui/skeleton';
import { siweAuthMiddleware } from '~/lib/middleware/auth';
import { rewardListQueryOptions } from '~/lib/query-client/reward/queries';

import { Suspense } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { RewardStats } from './components';
import { RewardsSummary } from './components/reward-summary';

/**
 * Apply SIWE authentication middleware
 * Ensures user is authenticated before accessing this route
 */
export const middleware = [siweAuthMiddleware];

const useRewardsTabsCountsQuery = () => {
  const { claimableRewardsCount, pendingRewardsCount, claimedRewardsCount } = useSuspenseQueries({
    queries: [
      rewardListQueryOptions({ claimableOnly: true }),
      rewardListQueryOptions({ pendingOnly: true }),
      rewardListQueryOptions({ claimedOnly: true }),
    ],
    combine([claimableRewardsQuery, pendingRewardsQuery, claimedRewardsQuery]) {
      return {
        claimableRewardsCount: claimableRewardsQuery.data?.data?.meta.total || 0,
        pendingRewardsCount: pendingRewardsQuery.data?.data?.meta.total || 0,
        claimedRewardsCount: claimedRewardsQuery.data?.data?.meta.total || 0,
      };
    },
  });

  return {
    claimableRewardsCount,
    pendingRewardsCount,
    claimedRewardsCount,
  };
};

const TabNavigation = () => {
  const { claimableRewardsCount, pendingRewardsCount, claimedRewardsCount } =
    useRewardsTabsCountsQuery();

  const tabs = [
    {
      to: '/dashboard/rewards/claimable',
      label: '💰 Claimable',
      badge: claimableRewardsCount?.toString() || '0',
    },
    {
      to: '/dashboard/rewards/pending',
      label: '⏳ Pending',
      badge: pendingRewardsCount?.toString() || '0',
    },
    {
      to: '/dashboard/rewards/history',
      label: '📜 History',
      badge: claimedRewardsCount?.toString() || '0',
    },
  ];

  return (
    <div className="flex gap-2 border-b">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {tab.label}
              {!tab.badge || tab.badge === '0' ? null : (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default function RewardsLayout() {
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
        <RewardStats.Grid columns={2}>
          <RewardsSummary.Root>
            <RewardsSummary.Header
              icon={<Gem className="h-6 w-6 text-primary" />}
              title="Your Rewards"
            />
            <RewardsSummary.Content>
              <RewardsSummary.BalanceNow />
            </RewardsSummary.Content>
          </RewardsSummary.Root>

          <RewardStats.Card title="Claimed" icon={<Check className="h-4 w-4 text-green-500" />}>
            <RewardStats.ClaimedCardContent />
          </RewardStats.Card>
        </RewardStats.Grid>

        {/* Tab Navigation */}
        <div className="space-y-4">
          <Suspense
            fallback={
              <div className="flex gap-2 border-b mb-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="w-32 h-8 rounded-md" />
                ))}
              </div>
            }
          >
            <TabNavigation />
          </Suspense>

          {/* Nested Route Content */}
          <div className="min-h-[400px]">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
