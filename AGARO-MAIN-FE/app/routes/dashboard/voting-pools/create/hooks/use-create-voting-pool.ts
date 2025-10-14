/**
 * Create Voting Pool Hook
 *
 * Custom hook for creating new voting pools on the blockchain.
 * Integrates with the EntryPoint smart contract.
 * Includes off-chain hash computation and on-chain verification.
 * Handles Merkle root generation for private pools.
 */
import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';
import { createPollMutationOptions } from '~/lib/query-client/poll/mutations';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useReadEntryPointVersion,
  useWatchEntryPointVotingPoolCreatedEvent,
  useWriteEntryPointNewVotingPool,
} from '~/lib/web3/contracts/generated';
import { generateMerkleRoot } from '~/lib/web3/utils';
import { getVotingPoolHash } from '~/lib/web3/voting-pool-utils';

import { useEffect, useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

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
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [offChainHash, setOffChainHash] = useState<`0x${string}` | null>(null);
  const [onChainHash, setOnChainHash] = useState<`0x${string}` | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [votingPoolData, setVotingPoolData] = useState<VotingPoolData | null>(null);
  const offChainHashRef = useRef<`0x${string}` | null>(null);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: storePoll, isPending: isCreatePollWeb2Pending } =
    useMutation(createPollMutationOptions);

  // Prepare the contract write
  const {
    writeContractAsync,
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
    enabled: isVerifying,
    onError: (error) => {
      if (isVerifying) {
        setVerificationError(error instanceof Error ? error.message : 'Unknown error');
        setIsVerifying(false);

        // Clear timeout on error
        if (verificationTimeoutRef.current) {
          clearTimeout(verificationTimeoutRef.current);
          verificationTimeoutRef.current = null;
        }
      }
    },
    onLogs: (logs) => {
      logs.forEach((log, index) => {
        const { poolHash: onChainHash, version: eventVersion } = log.args;

        // Only proceed for the last log in the array
        if (index !== logs.length - 1) {
          return;
        }

        // Only verify if we have an off-chain hash waiting
        if (!offChainHashRef.current || !onChainHash) {
          return;
        }

        // Clear verification timeout
        if (verificationTimeoutRef.current) {
          clearTimeout(verificationTimeoutRef.current);
          verificationTimeoutRef.current = null;
        }

        // Compare hashes
        if (offChainHashRef.current !== onChainHash) {
          // Hash mismatch - security alert!
          setVerificationError(
            'Off-chain and on-chain hashes do not match. This may indicate a security issue.'
          );
          setIsVerifying(false);

          // Clear the reference after error
          offChainHashRef.current = null;
          setOffChainHash(null);
        } else {
          // Hashes match - success!
          setOnChainHash(onChainHash);
          setIsVerifying(false);
          setShouldRedirect(true);

          if (!votingPoolData || !walletAddress || !onChainHash) {
            return;
          }

          // Store to web 2 DB
          storePoll({
            title: votingPoolData.title,
            description: votingPoolData.description,
            choices: votingPoolData.candidates.map((choice) => ({ choiceText: choice })),
            startDate: new Date(), // For now using now
            endDate: votingPoolData.expiryDate,
            isPrivate: votingPoolData.isPrivate,
            addresses: votingPoolData.allowedAddresses.map((address) => ({
              walletAddress: address,
            })),
            creatorWalletAddress: walletAddress,
            poolHash: onChainHash,
          });

          // Clear the reference (but keep state for UI to show success)
          offChainHashRef.current = null;
          // DON'T clear offChainHash state - form needs it to detect success!
        }
      });
    },
  });

  const storePollDataImmediately = (poolData: VotingPoolData, poolHash: `0x${string}`) => {
    if (!walletAddress) return;

    // Hashes match - success!
    setOnChainHash(poolHash);
    setIsVerifying(false);
    setShouldRedirect(true);

    // Store immediately to backend
    storePoll({
      title: poolData.title,
      description: poolData.description,
      choices: poolData.candidates.map((choice) => ({ choiceText: choice })),
      startDate: new Date(), // For now using now
      endDate: poolData.expiryDate,
      isPrivate: poolData.isPrivate,
      addresses: poolData.allowedAddresses.map((address) => ({
        walletAddress: address,
      })),
      creatorWalletAddress: walletAddress,
      poolHash,
    });
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

    if (typeof version === 'undefined') {
      toast.error('Could not fetch contract version');
      return;
    }

    setVotingPoolData(poolData);

    try {
      // Calculate expiry timestamps
      const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
      const endDate = Math.floor(poolData.expiryDate.getTime() / 1000); // Convert to Unix timestamp

      // Generate Merkle root hash if private pool, otherwise use zero hash
      let merkleRootHash: `0x${string}` =
        '0x0000000000000000000000000000000000000000000000000000000000000000';

      if (poolData.allowedAddresses.length > 0) {
        merkleRootHash = generateMerkleRoot(poolData.allowedAddresses);
      }

      // Convert candidatesTotal to uint8 format
      const candidatesTotalUint8 = poolData.candidatesTotal as unknown as number;

      const args = {
        versioning: version,
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
      };

      const targetHashedPayload = {
        title: poolData.title,
        description: poolData.description,
        candidates: poolData.candidates,
        candidatesTotal: candidatesTotalUint8,
        version,
        owner: walletAddress,
      };

      // Compute off-chain hash before submission
      const poolHash = getVotingPoolHash(targetHashedPayload, version, walletAddress);

      // Store hash for later verification
      setOffChainHash(poolHash);
      offChainHashRef.current = poolHash;

      // Submit to blockchain
      await writeContractAsync({
        address: contractAddress,
        args: [args],
      });

      if (poolData.isPrivate) {
        storePollDataImmediately(poolData, poolHash);
      }
    } catch (error) {
      toast.error('Failed to create pool', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Start verification when transaction is confirmed
  useEffect(() => {
    if (isSuccess && offChainHashRef.current) {
      setIsVerifying(true);
      setVerificationError(null);

      // Set a 30-second timeout for verification
      verificationTimeoutRef.current = setTimeout(() => {
        if (offChainHashRef.current) {
          setVerificationError(
            'Verification timeout: Event not received from blockchain within 30 seconds. Please check the blockchain explorer.'
          );
          setIsVerifying(false);
          offChainHashRef.current = null;
          setOffChainHash(null);
        }
      }, 30000);
    }
  }, [isSuccess]);

  // Refetch version after successful pool creation
  // This is critical for replay attack prevention - version increments with each pool
  useEffect(() => {
    if (isSuccess) {
      refetchVersion();
    }
  }, [isSuccess, refetchVersion]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  return {
    createPool,
    isPending: isCreatePollWeb2Pending || isPending,
    isConfirming,
    isSuccess,
    isVerifying,
    verificationError,
    isError,
    error,
    txHash,
    onChainHash,
    offChainHash,
    shouldRedirect,
  };
}
