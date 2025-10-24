/**
 * Create Voting poll Hook
 *
 * Custom hook for creating new voting polls on the blockchain.
 * Integrates with the EntryPoint smart contract.
 * Includes off-chain hash computation and on-chain verification.
 * Handles Merkle root generation for private polls.
 */
import { toast } from 'sonner';
import { type Address, parseEther } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';
import { createPollMutationOptions } from '~/lib/query-client/poll/mutations';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useReadEntryPointVersion,
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [pollData, setPollData] = useState<PollData | null>(null);
  const offChainHashRef = useRef<`0x${string}` | null>(null);

  const {
    mutate: storePoll,
    isPending: isCreatePollWeb2Pending,
    data: storePollData,
  } = useMutation({
    ...createPollMutationOptions,
    onSuccess: () => {
      const contractAddress = getEntryPointAddress(chainId);
      if (!contractAddress) {
        toast.error('Contract not deployed on this network');
        return;
      }

      if (!pollData) {
        toast.error('Poll data is missing');
        return;
      }

      if (!version) {
        toast.error('Could not fetch contract version');
        return;
      }

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

      // Submit to blockchain FIRST (for both private and public polls)
      writeCreateNewVotingPoll({
        address: contractAddress,
        args: [args],
      });
    },
    onError: (error) => {
      console.error('Failed to store poll to backend:', error);
      setIsVerifying(false);

      const { title, description } = parseWagmiErrorForToast(error);

      toast.error(title, {
        description,
      });
    },
  });

  const hasConnected = !!chainId && !!walletAddress;

  // Prepare the contract write
  const {
    writeContract: writeCreateNewVotingPoll,
    data: txHash,
    isPending,
    isError,
    error,
  } = useWriteEntryPointNewVotingPoll({
    mutation: {
      onError: (error) => {
        console.error('Failed to write contract transaction:', error);
        setIsVerifying(false);

        // Parse the error and show user-friendly message
        const { title, description } = parseWagmiErrorForToast(error);
        toast.error(title, {
          description,
        });
      },
    },
  });

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
    query: {
      enabled: !!txHash,
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
      // Convert candidatesTotal to uint8 format

      const targetHashedPayload = {
        title: pollData.title,
        description: pollData.description,
        candidates: pollData.candidates,
        candidatesTotal: pollData.candidatesTotal,
        version,
        owner: walletAddress,
      };

      // Compute off-chain hash before submission
      const pollHash = getVotingPollHash(targetHashedPayload, version, walletAddress);

      // Store hash for later verification
      setOffChainHash(pollHash);
      offChainHashRef.current = pollHash;

      // Store to backend
      storePoll({
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
        pollHash,
        rewardShare: pollData.rewardShare ? Number(pollData.rewardShare) : 0,
        isTokenRequired: pollData.isTokenRequired,
      });
    } catch (error) {
      // Parse the error and show user-friendly message
      const { title, description } = parseWagmiErrorForToast(error);
      toast.error(title, {
        description,
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      refetchVersion();
      setIsVerifying(false);
      setShouldRedirect(true);
    }
  }, [isSuccess]);

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
    offChainHash,
    shouldRedirect,
    storePollData,
  };
}
