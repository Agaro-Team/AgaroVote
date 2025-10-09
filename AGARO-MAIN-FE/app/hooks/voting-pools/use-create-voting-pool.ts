/**
 * Create Voting Pool Hook
 *
 * Custom hook for creating new voting pools on the blockchain.
 * Integrates with the EntryPoint smart contract.
 * Includes off-chain hash computation and on-chain verification.
 * Handles Merkle root generation for private pools.
 */
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';
import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useReadEntryPointVersion,
  useWatchEntryPointVotingPoolCreatedEvent,
  useWriteEntryPointNewVotingPool,
} from '~/lib/web3/contracts/generated';
import { createVotingPoolData, getVotingPoolHash } from '~/lib/web3/voting-pool-utils';

import { useEffect, useRef, useState } from 'react';

import { useWeb3Chain, useWeb3Wallet } from '../use-web3';

export interface VotingPoolData {
  title: string;
  description: string;
  candidates: string[];
  candidatesTotal: number;
  expiryDate: Date;
  isPrivate: boolean;
  allowedAddresses: string[];
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
  const { address: walletAddress } = useWeb3Wallet();
  const [offChainHash, setOffChainHash] = useState<`0x${string}` | null>(null);
  const offChainHashRef = useRef<`0x${string}` | null>(null);

  // Prepare the contract write
  const {
    writeContract,
    data: txHash,
    isPending,
    isError,
    error,
  } = useWriteEntryPointNewVotingPool();

  const { data: version, refetch: refetchVersion } = useReadEntryPointVersion({
    address: getEntryPointAddress(chainId),
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Watch for VotingPoolCreated event to verify hash
  useWatchEntryPointVotingPoolCreatedEvent({
    address: getEntryPointAddress(chainId),
    onError: (error) => {
      toast.error('Event monitoring error', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000,
      });
    },
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { poolHash: onChainHash, version: eventVersion } = log.args;

        // Only verify if we have an off-chain hash waiting
        if (!offChainHashRef.current || !onChainHash) {
          return;
        }

        // Verify version matches (optional but recommended)
        if (eventVersion !== version) {
          return;
        }

        // Compare hashes
        if (offChainHashRef.current !== onChainHash) {
          // Hash mismatch - security alert!

          toast.error('Hash Anomaly Detected!', {
            description:
              'Off-chain and on-chain hashes do not match. This may indicate a security issue.',
            duration: 10000,
          });
        } else {
          toast.success('Hash Verified!', {
            description: 'Off-chain and on-chain hashes match perfectly.',
          });
        }

        // Clear the reference after verification
        offChainHashRef.current = null;
        setOffChainHash(null);
      });
    },
  });

  /**
   * Generate Merkle root hash from allowed addresses
   * This is done off-chain to minimize gas fees
   */
  const generateMerkleRoot = (addresses: string[]): `0x${string}` => {
    // Hash each address using keccak256
    const leaves = addresses.map((addr) => keccak256(addr));

    // Create merkle tree with sorted pairs
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

    // Get the root hash
    const root = tree.getHexRoot() as `0x${string}`;

    return root;
  };

  /**
   * Create a new voting pool
   * @param poolData - The voting pool data containing title, description, candidates, expiry, privacy settings, and allowed addresses
   */
  const createPool = async (poolData: VotingPoolData) => {
    if (!chainId) {
      toast.error('No chain connected');
      return;
    }

    const contractAddress = getEntryPointAddress(chainId);
    if (!contractAddress) {
      toast.error('Contract not deployed on this network');
      return;
    }

    if (!walletAddress) {
      toast.error('Wallet not connected');
      return;
    }

    if (!version) {
      toast.error('Could not fetch contract version');
      return;
    }

    try {
      // Calculate expiry timestamps
      const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
      const endDate = Math.floor(poolData.expiryDate.getTime() / 1000); // Convert to Unix timestamp

      // Generate Merkle root hash if private pool, otherwise use zero hash
      let merkleRootHash: `0x${string}` =
        '0x0000000000000000000000000000000000000000000000000000000000000000';

      if (poolData.isPrivate && poolData.allowedAddresses.length > 0) {
        merkleRootHash = generateMerkleRoot(poolData.allowedAddresses);
      }

      // Compute off-chain hash before submission
      const fullPoolData = createVotingPoolData({
        title: poolData.title,
        description: poolData.description,
        candidates: poolData.candidates,
        allowedAddresses: poolData.allowedAddresses,
        expiryDate: poolData.expiryDate,
        isPrivate: poolData.isPrivate,
      });

      const computedHash = getVotingPoolHash(fullPoolData, version, walletAddress);

      // Store hash for later verification
      setOffChainHash(computedHash);
      offChainHashRef.current = computedHash;

      // Convert candidatesTotal to uint8 format
      const candidatesTotalUint8 = poolData.candidatesTotal as unknown as number;

      // Submit to blockchain
      writeContract({
        address: contractAddress,
        args: [
          {
            title: poolData.title,
            description: poolData.description,
            merkleRootHash,
            isPrivate: poolData.isPrivate,
            candidates: poolData.candidates,
            candidatesTotal: candidatesTotalUint8,
            expiry: {
              startDate: BigInt(now),
              endDate: BigInt(endDate),
            },
          },
        ],
      });
    } catch (error) {
      toast.error('Failed to create pool', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Refetch version after successful pool creation
  // This is critical for replay attack prevention - version increments with each pool
  useEffect(() => {
    if (isSuccess) {
      console.log('🔄 Refetching version for next pool creation (replay attack prevention)');
      refetchVersion();
    }
  }, [isSuccess, refetchVersion]);

  return {
    createPool,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    txHash,
    offChainHash,
  };
}
