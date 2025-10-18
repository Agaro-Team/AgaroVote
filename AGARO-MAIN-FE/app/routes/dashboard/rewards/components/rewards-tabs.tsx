/**
 * Rewards Tabs Component
 *
 * Tab navigation for Claimable, Pending, and History sections
 */
import { Skeleton } from '~/components/ui/skeleton';
import { rewardListQueryOptions } from '~/lib/query-client/reward/queries';

import { Suspense } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { type ActiveTab, useTabsQueryState } from '../hooks/use-tabs-query-state';

interface RewardsTabsProps {
  claimableContent: React.ReactNode;
  pendingContent: React.ReactNode;
  historyContent: React.ReactNode;
}

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

export function RewardsTabs({
  claimableContent,
  pendingContent,
  historyContent,
}: RewardsTabsProps) {
  const [activeTab, setActiveTab] = useTabsQueryState();

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Suspense
          fallback={
            <div className="flex gap-2 mb-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-32 h-8 rounded-md" />
              ))}
            </div>
          }
        >
          <TabsButton activeTab={activeTab} setActiveTab={setActiveTab} />
        </Suspense>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'claimable' && claimableContent}
        {activeTab === 'pending' && pendingContent}
        {activeTab === 'history' && historyContent}
      </div>
    </div>
  );
}

const TabsButton = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}) => {
  const { claimableRewardsCount, pendingRewardsCount, claimedRewardsCount } =
    useRewardsTabsCountsQuery();

  const tabs = [
    {
      id: 'claimable' as const,
      label: '💰 Claimable',
      badge: claimableRewardsCount?.toString() || '0',
    },
    { id: 'pending' as const, label: '⏳ Pending', badge: pendingRewardsCount?.toString() || '0' },
    { id: 'history' as const, label: '📜 History', badge: claimedRewardsCount?.toString() || '0' },
  ];

  return tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
        activeTab === tab.id
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {tab.label}
      {!tab.badge || tab.badge === '0' ? null : (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {tab.badge}
        </span>
      )}
    </button>
  ));
};
