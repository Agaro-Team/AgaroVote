/**
 * Claimable Rewards Page
 *
 * Displays list of rewards that can be claimed from ended voting polls.
 */
import { Suspense } from 'react';

import { ClaimableRewardsList } from '../components/claimable-rewards-list';
import { RewardSkeletonList } from '../components/reward-skeleton-list';

export default function ClaimableRewardsPage() {
  return (
    <Suspense fallback={<RewardSkeletonList />}>
      <ClaimableRewardsList />
    </Suspense>
  );
}
