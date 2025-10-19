import { formatEther, parseEther } from 'viem';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';
import { rewardDashboardSummaryQueryOptions } from '~/lib/query-client/reward/queries';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import { useReadAgaroBalanceOf, useReadEntryPointToken } from '~/lib/web3/contracts/generated';

import { useQuery } from '@tanstack/react-query';

import { useSyntheticRewardsEarned } from './use-synthetic-rewards-earned';

/**
 * Hook to get reward dashboard summary from backend
 * Returns aggregated statistics and contract addresses
 */
export const useRewardDashboardSummary = () => useQuery(rewardDashboardSummaryQueryOptions);

/**
 * Hook to get complete reward dashboard with on-chain earned amounts
 * Combines backend summary with live on-chain data
 *
 * @example
 * ```tsx
 * function RewardsDashboard() {
 *   const {
 *     summary,
 *     claimableRewards,
 *     pendingRewards,
 *     totalClaimableEarned,
 *     totalPendingEarned,
 *     isLoading
 *   } = useRewardDashboardWithEarned();
 *
 *   return (
 *     <div>
 *       <h2>Total Claimable: {formatEther(totalClaimableEarned)} ETH</h2>
 *       {claimableRewards.map(reward => (
 *         <div key={reward.contractAddress}>
 *           Contract: {reward.contractAddress}
 *           Earned: {formatEther(reward.earned)} ETH
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRewardDashboardWithEarned() {
  // Get backend summary
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useRewardDashboardSummary();

  // Get on-chain earned amounts for claimable rewards
  const {
    rewards: claimableRewards,
    totalEarned: totalClaimableEarned,
    isLoading: isClaimableLoading,
    refetch: refetchClaimable,
  } = useSyntheticRewardsEarned({
    syntheticAddresses: summary?.syntheticClaimablePlucks || [],
    enabled: !!summary?.syntheticClaimablePlucks?.length,
  });

  // Get on-chain earned amounts for pending rewards
  const {
    rewards: pendingRewards,
    totalEarned: totalPendingEarned,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useSyntheticRewardsEarned({
    syntheticAddresses: summary?.syntheticPendingPlucks || [],
    enabled: !!summary?.syntheticPendingPlucks?.length,
  });

  // Get on-chain earned amounts for claimed rewards (for reference)
  const {
    rewards: claimedRewards,
    totalEarned: totalClaimedEarned,
    isLoading: isClaimedLoading,
    refetch: refetchClaimed,
  } = useSyntheticRewardsEarned({
    syntheticAddresses: summary?.syntheticClaimedPlucks || [],
    enabled: !!summary?.syntheticClaimedPlucks?.length,
  });

  // Refetch all data
  const refetchAll = () => {
    refetchSummary();
    refetchClaimable();
    refetchPending();
    refetchClaimed();
  };

  return {
    // Backend summary data
    summary,

    // On-chain earned amounts by category
    claimableRewards,
    pendingRewards,
    claimedRewards,

    // Totals
    totalClaimableEarned,
    totalPendingEarned,
    totalClaimedEarned,

    // Loading states
    isLoading: isSummaryLoading || isClaimableLoading || isPendingLoading || isClaimedLoading,
    isSummaryLoading,
    isClaimableLoading,
    isPendingLoading,
    isClaimedLoading,

    // Error handling
    error: summaryError,

    // Refetch functions
    refetch: refetchAll,
    refetchSummary,
    refetchClaimable,
    refetchPending,
    refetchClaimed,
  };
}

export function useRewardDashboardBalanceNow() {
  const { address: accountAddress, isConnecting } = useWeb3Wallet();
  const { chainId } = useWeb3Chain();

  const { data: tokenAddress, isLoading: isTokenLoading } = useReadEntryPointToken({
    address: getEntryPointAddress(chainId) as `0x${string}`,
    query: {
      enabled: !!accountAddress && !!chainId,
    },
  });

  const { data: balance, isLoading: isBalanceLoading } = useReadAgaroBalanceOf({
    address: tokenAddress as `0x${string}`,
    args: [accountAddress as `0x${string}`],
    query: {
      enabled: !!accountAddress && !!tokenAddress,
    },
  });

  const balanceAmount = balance ? Number(formatEther(balance)).toFixed(4) : 0;

  const isLoading = isBalanceLoading || isTokenLoading || isConnecting;

  return {
    balanceAmount,
    rawBalance: parseEther(balanceAmount.toString()),
    isLoading,
  };
}
