/**
 * Pending Rewards Page
 *
 * Displays list of pending rewards from active voting polls.
 */
import { Suspense } from 'react';

import { PendingRewardsList } from '../components/pending-rewards-list';
import { RewardSkeletonList } from '../components/reward-skeleton-list';

export default function PendingRewardsPage() {
  return (
    <Suspense fallback={<RewardSkeletonList />}>
      <PendingRewardsList />
    </Suspense>
  );
}
