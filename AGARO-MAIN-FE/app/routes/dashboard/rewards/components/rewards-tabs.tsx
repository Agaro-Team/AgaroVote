/**
 * Rewards Tabs Component
 *
 * Tab navigation for Claimable, Pending, and History sections
 */
import { useState } from 'react';

interface RewardsTabsProps {
  claimableContent: React.ReactNode;
  pendingContent: React.ReactNode;
  historyContent: React.ReactNode;
}

export function RewardsTabs({
  claimableContent,
  pendingContent,
  historyContent,
}: RewardsTabsProps) {
  const [activeTab, setActiveTab] = useState<'claimable' | 'pending' | 'history'>('claimable');

  const tabs = [
    { id: 'claimable' as const, label: '💰 Claimable', badge: '12' },
    { id: 'pending' as const, label: '⏳ Pending', badge: '5' },
    { id: 'history' as const, label: '📜 History', badge: '89' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
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
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
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
