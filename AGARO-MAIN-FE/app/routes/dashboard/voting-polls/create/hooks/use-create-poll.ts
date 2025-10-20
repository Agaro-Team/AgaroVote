/**
 * Create Voting poll Hook
 *
 * Custom hook for creating new voting polls on the blockchain.
 * Integrates with the EntryPoint smart contract.
 * Includes off-chain hash computation and on-chain verification.
 * Handles Merkle root generation for private polls.
 */
import { toast } from 'sonner';
import { type Address, keccak256, parseEther } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';
import { createPollMutationOptions } from '~/lib/query-client/poll/mutations';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useReadEntryPointVersion,
  useWatchEntryPointVotingPollCreatedEvent,
  useWriteEntryPointNewVotingPoll,
} from '~/lib/web3/contracts/generated';
import { parseWagmiErrorForToast } from '~/lib/web3/error-parser';
import { createHexRootByAddresses, createLeaveHashByAddress } from '~/lib/web3/utils';
import { getVotingPollHash } from '~/lib/web3/voting-poll-utils';

import { useEffect, useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

export interface PollData {
  title: string;
  description: string;
  candidates: string[];
  candidatesTotal: number;
  startDate: Date;
  endDate: Date;
  isPrivate: boolean;
  allowedAddresses: string[];
  rewardShare: string;
  isTokenRequired: boolean;
}

/**
 * useCreatePoll Hook
 *
 * Creates a new voting poll on the blockchain
 *
 * @example
 * ```tsx
 * const { createPoll, isPending, isSuccess } = useCreatePoll();
 *
 * const handleSubmit = (data: PollData) => {
 *   createPoll(data);
 * };
 * ```
 */
export function useCreatePoll() {
  const { chainId } = useWeb3Chain();
  const { address: walletAddress } = useWeb3Wallet();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [offChainHash, setOffChainHash] = useState<`0x${string}` | null>(null);
  const [onChainHash, setOnChainHash] = useState<`0x${string}` | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [pollData, setPollData] = useState<PollData | null>(null);
  const offChainHashRef = useRef<`0x${string}` | null>(null);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    mutateAsync: storePoll,
    isPending: isCreatePollWeb2Pending,
    data: storePollData,
  } = useMutation(createPollMutationOptions);

  const hasConnected = !!chainId && !!walletAddress;

  // Prepare the contract write
  const {
    writeContractAsync,
    data: txHash,
    isPending,
    isError,
    error,
  } = useWriteEntryPointNewVotingPoll();

  const { data: version, refetch: refetchVersion } = useReadEntryPointVersion({
    address: getEntryPointAddress(chainId),
    chainId,
    query: {
      enabled: hasConnected,
    },
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
  });

  // Function to store poll data to backend after blockchain confirmation
  const storePollToBackend = async (pollData: PollData, pollHash: `0x${string}`) => {
    if (!walletAddress) return;

    // Store to backend
    await storePoll({
      title: pollData.title,
      description: pollData.description,
      choices: pollData.candidates.map((choice) => ({ choiceText: choice })),
      startDate: pollData.startDate,
      endDate: pollData.endDate,
      isPrivate: pollData.isPrivate,
      addresses: pollData.allowedAddresses.map((address) => ({
        walletAddress: address,
        leaveHash: createLeaveHashByAddress(address as Address),
      })),
      creatorWalletAddress: walletAddress,
      pollHash: pollHash,
      rewardShare: pollData.rewardShare ? Number(pollData.rewardShare) : 0,
      isTokenRequired: pollData.isTokenRequired,
    });

    // Set success states after backend storage
    setOnChainHash(pollHash);
    setIsVerifying(false);
    setShouldRedirect(true);
  };

  // Watch for VotingpollCreated event to verify hash
  useWatchEntryPointVotingPollCreatedEvent({
    address: getEntryPointAddress(chainId),
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
        const { pollHash: onChainHash } = log.args;

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
          // Now store to backend after blockchain confirmation
          if (!pollData || !walletAddress || !onChainHash) {
            return;
          }

          // Clear the reference (but keep state for UI to show success)
          offChainHashRef.current = null;
          // DON'T clear offChainHash state - form needs it to detect success!
        }
      });
    },
  });

  /**
   * Create a new voting poll
   * @param pollData - The voting poll data containing title, description, candidates, start/end dates, privacy settings, and allowed addresses
   */
  const createPoll = async (pollData: PollData) => {
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

    setPollData(pollData);

    try {
      // Calculate timestamps for voting period
      const startDate = Math.floor(pollData.startDate.getTime() / 1000); // Convert to Unix timestamp
      const endDate = Math.floor(pollData.endDate.getTime() / 1000); // Convert to Unix timestamp

      // Generate Merkle root hash if private poll, otherwise use zero hash
      let merkleRootHash: Address =
        '0x0000000000000000000000000000000000000000000000000000000000000000';

      if (pollData.allowedAddresses.length > 0) {
        merkleRootHash = createHexRootByAddresses(
          pollData.allowedAddresses.map((address) => address as Address)
        );
      }

      // Convert candidatesTotal to uint8 format
      const candidatesTotalUint8 = pollData.candidatesTotal as unknown as number;

      // Convert rewardShare string to BigInt (handle empty or invalid values)
      const rewardShareBigInt =
        pollData.rewardShare && pollData.rewardShare.trim() !== ''
          ? parseEther(pollData.rewardShare)
          : parseEther('0');

      const args = {
        versioning: version,
        title: pollData.title,
        description: pollData.description,
        merkleRootHash,
        isPrivate: pollData.isPrivate,
        candidates: pollData.candidates,
        candidatesTotal: candidatesTotalUint8,
        expiry: {
          startDate: BigInt(startDate),
          endDate: BigInt(endDate),
        },
        isTokenRequired: pollData.isTokenRequired,
        rewardShare: rewardShareBigInt,
      } as const;

      const targetHashedPayload = {
        title: pollData.title,
        description: pollData.description,
        candidates: pollData.candidates,
        candidatesTotal: candidatesTotalUint8,
        version,
        owner: walletAddress,
      };

      // Compute off-chain hash before submission
      const pollHash = getVotingPollHash(targetHashedPayload, version, walletAddress);

      // Store hash for later verification
      setOffChainHash(pollHash);
      offChainHashRef.current = pollHash;

      // Submit to blockchain FIRST (for both private and public polls)
      await writeContractAsync({
        address: contractAddress,
        args: [args],
      });
    } catch (error) {
      // Parse the error and show user-friendly message
      const { title, description } = parseWagmiErrorForToast(error);
      toast.error(title, {
        description,
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

  // Refetch version after successful poll creation
  // This is critical for replay attack prevention - version increments with each poll
  useEffect(() => {
    if (isSuccess) {
      refetchVersion();

      if (!pollData) return;
      if (!offChainHashRef.current) return;

      // Store to backend after blockchain transaction is confirmed
      storePollToBackend(pollData, offChainHashRef.current).catch((error) => {
        console.error('Failed to store poll to backend:', error);
        toast.error('Failed to store poll data', {
          description: 'Blockchain transaction succeeded, but backend storage failed.',
        });
      });
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
    createPoll,
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
    storePollData,
  };
}
