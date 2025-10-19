import { type Address, formatEther } from 'viem';
import { useReadContracts } from 'wagmi';
import { useWeb3Wallet } from '~/hooks/use-web3';
import { syntheticRewardAbi } from '~/lib/web3/contracts/generated';

interface SyntheticRewardEarned {
  contractAddress: Address;
  earned: bigint;
  isLoading: boolean;
  error: Error | null;
}

interface UseSyntheticRewardsEarnedParams {
  /** Array of synthetic reward contract addresses */
  syntheticAddresses: Address[];
  /** Voter's wallet address */
  voterAddress?: Address;
  /** Enable/disable the query */
  enabled?: boolean;
}
/**
 * Hook to read earned rewards from multiple SyntheticReward contracts
 *
 * Uses wagmi's useReadContracts to batch multiple contract reads efficiently
 *
 * @example
 * ```tsx
 * const { rewards, totalEarned, isLoading } = useSyntheticRewardsEarned({
 *   syntheticAddresses: ['0x123...', '0x456...'],
 *   voterAddress: '0xabc...',
 * });
 *
 * console.log('Total earned:', formatEther(totalEarned));
 * rewards.forEach(r => {
 *   console.log(`Contract ${r.contractAddress}: ${formatEther(r.earned)}`);
 * });
 * ```
 */
export function useSyntheticRewardsEarned({
  syntheticAddresses,
  voterAddress,
  enabled = true,
}: UseSyntheticRewardsEarnedParams) {
  const { address: walletAddress } = useWeb3Wallet();

  // Use provided voter address or fallback to connected wallet
  const targetAddress = voterAddress || walletAddress;

  // Prepare contract calls for all addresses
  const contracts = syntheticAddresses.map((address) => ({
    address,
    abi: syntheticRewardAbi,
    functionName: 'earned' as const,
    args: targetAddress ? [targetAddress] : undefined,
  }));

  // Execute all contract reads in parallel (batched by wagmi)
  const { data, isLoading, isSuccess, isError, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: enabled && !!targetAddress && syntheticAddresses.length > 0,
      // Refetch every 10 seconds to keep rewards updated
      refetchInterval: 10000,
    },
  });

  // Process results
  const rewards: SyntheticRewardEarned[] = syntheticAddresses.map((address, index) => {
    const result = data?.[index];

    return {
      contractAddress: address,
      earned: result?.status === 'success' ? (result.result as bigint) : 0n,
      isLoading: !data,
      error: result?.status === 'failure' ? (result.error as Error) : null,
    };
  });

  // Calculate total earned across all contracts
  const totalEarned = rewards.reduce((sum, reward) => sum + reward.earned, 0n);
  const formattedTotalEarned = totalEarned ? Number(formatEther(totalEarned)).toFixed(4) : 0;

  return {
    rewards,
    totalEarned,
    formattedTotalEarned,
    isLoading,
    isSuccess,
    isError,
    refetch,
  };
}
