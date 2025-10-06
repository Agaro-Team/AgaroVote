/**
 * Create Voting Pool Hook
 *
 * Custom hook for creating new voting pools on the blockchain.
 * Integrates with the EntryPoint smart contract.
 */
import { useWaitForTransactionReceipt } from 'wagmi';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useReadEntryPointVersion,
  useSimulateEntryPointNewVotingPool,
  useWriteEntryPointNewVotingPool,
} from '~/lib/web3/contracts/generated';

import { useWeb3Chain } from './use-web3';

export interface VotingPoolData {
  title: string;
  description: string;
  candidates: string[];
  candidatesTotal: number;
}

/**
 * useCreateVotingPool Hook
 *
 * Creates a new voting pool on the blockchain
 *
 * @example
 * ```tsx
 * const { createPool, isPending, isSuccess } = useCreateVotingPool();
 *
 * const handleSubmit = (data: VotingPoolData) => {
 *   createPool(data);
 * };
 * ```
 */
export function useCreateVotingPool() {
  const { chainId } = useWeb3Chain();

  // Prepare the contract write
  const {
    writeContract,
    data: txHash,
    isPending,
    isError,
    error,
  } = useWriteEntryPointNewVotingPool();

  const { data: version } = useReadEntryPointVersion({
    address: getEntryPointAddress(chainId),
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  /**
   * Create a new voting pool
   * @param poolData - The voting pool data containing title, description, candidates, and candidatesTotal
   */
  const createPool = (poolData: VotingPoolData) => {
    if (!chainId) {
      console.error('No chain connected');
      return;
    }

    const contractAddress = getEntryPointAddress(chainId);
    if (!contractAddress) {
      console.error('Contract not deployed on this network');
      return;
    }

    // Convert candidatesTotal to uint8 format
    const candidatesTotalUint8 = poolData.candidatesTotal as unknown as number;

    writeContract({
      address: contractAddress,
      args: [
        {
          title: poolData.title,
          description: poolData.description,
          candidates: poolData.candidates,
          candidatesTotal: candidatesTotalUint8,
        },
      ],
    });
  };

  return {
    createPool,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    txHash,
  };
}
