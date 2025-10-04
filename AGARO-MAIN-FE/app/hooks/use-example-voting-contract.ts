/**
 * Example Voting Contract Hooks
 *
 * Custom hooks for interacting with the voting smart contract.
 * This follows the same pattern as the existing use-web3.ts hooks.
 *
 * USAGE:
 * 1. Replace the contract ABI and addresses in lib/contracts/example-voting-contract.ts
 * 2. Update function names to match your actual contract
 * 3. Import and use these hooks in your components
 */
import {
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from 'wagmi';
import {
  EXAMPLE_VOTING_CONTRACT_ABI,
  getVotingContractAddress,
} from '~/lib/web3/contracts/example-voting-contract';

import { useEffect } from 'react';

import { useWeb3Chain, useWeb3Wallet } from './use-web3';

/**
 * useTotalVotes Hook
 *
 * Reads the total number of votes from the smart contract
 *
 * @example
 * ```tsx
 * const { totalVotes, isLoading, refetch } = useTotalVotes();
 *
 * return <p>Total Votes: {totalVotes}</p>;
 * ```
 */
export function useTotalVotes() {
  const { chainId } = useWeb3Chain();
  const contractAddress = getVotingContractAddress(chainId);

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: EXAMPLE_VOTING_CONTRACT_ABI,
    functionName: 'getTotalVotes',
    query: {
      enabled: !!contractAddress, // Only run query if contract exists on this chain
    },
  });

  return {
    totalVotes: data ? Number(data) : 0,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * useProposal Hook
 *
 * Reads proposal details from the smart contract
 *
 * @param proposalId - The ID of the proposal to fetch
 *
 * @example
 * ```tsx
 * const { proposal, isLoading, refetch } = useProposal(1);
 *
 * if (proposal) {
 *   return <div>{proposal.title} - {proposal.voteCount} votes</div>;
 * }
 * ```
 */
export function useProposal(proposalId: number) {
  const { chainId } = useWeb3Chain();
  const contractAddress = getVotingContractAddress(chainId);

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: EXAMPLE_VOTING_CONTRACT_ABI,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
    query: {
      enabled: !!contractAddress,
    },
  });

  return {
    proposal: data
      ? {
          title: data[0],
          voteCount: Number(data[1]),
          isActive: data[2],
        }
      : null,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * useHasVoted Hook
 *
 * Check if an address has already voted
 *
 * @param voterAddress - The address to check (defaults to connected wallet)
 *
 * @example
 * ```tsx
 * const { hasVoted, isLoading } = useHasVoted();
 *
 * if (hasVoted) {
 *   return <p>You have already voted!</p>;
 * }
 * ```
 */
export function useHasVoted(voterAddress?: `0x${string}`) {
  const { chainId } = useWeb3Chain();
  const { address } = useWeb3Wallet();
  const contractAddress = getVotingContractAddress(chainId);

  const targetAddress = voterAddress || address;

  const { data, isLoading, isError, refetch } = useReadContract({
    address: contractAddress,
    abi: EXAMPLE_VOTING_CONTRACT_ABI,
    functionName: 'hasVoted',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!contractAddress && !!targetAddress,
    },
  });

  return {
    hasVoted: data || false,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * useProposalBatch Hook
 *
 * Fetch multiple proposals at once using multicall
 *
 * @param proposalIds - Array of proposal IDs to fetch
 *
 * @example
 * ```tsx
 * const { proposals, isLoading } = useProposalBatch([1, 2, 3]);
 *
 * proposals.forEach(proposal => {
 *   console.log(proposal?.title);
 * });
 * ```
 */
export function useProposalBatch(proposalIds: number[]) {
  const { chainId } = useWeb3Chain();
  const contractAddress = getVotingContractAddress(chainId);

  const contracts = proposalIds.map((id) => ({
    address: contractAddress,
    abi: EXAMPLE_VOTING_CONTRACT_ABI,
    functionName: 'getProposal' as const,
    args: [BigInt(id)],
  }));

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: !!contractAddress && proposalIds.length > 0,
    },
  });

  const proposals =
    data?.map((result) => {
      if (result.status === 'success' && result.result) {
        const [title, voteCount, isActive] = result.result as [string, bigint, boolean];
        return {
          title,
          voteCount: Number(voteCount),
          isActive,
        };
      }
      return null;
    }) || [];

  return {
    proposals,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * useSubmitVote Hook
 *
 * Submit a vote for a proposal (write operation)
 *
 * @example
 * ```tsx
 * const { vote, isPending, isSuccess, isError } = useSubmitVote();
 *
 * return (
 *   <button
 *     onClick={() => vote(1)}
 *     disabled={isPending}
 *   >
 *     {isPending ? 'Voting...' : 'Vote'}
 *   </button>
 * );
 * ```
 */
export function useSubmitVote() {
  const { chainId } = useWeb3Chain();
  const contractAddress = getVotingContractAddress(chainId);

  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const vote = (proposalId: number) => {
    if (!contractAddress) {
      console.error('Contract not deployed on this network');
      return;
    }

    writeContract({
      address: contractAddress,
      abi: EXAMPLE_VOTING_CONTRACT_ABI,
      functionName: 'vote',
      args: [BigInt(proposalId)],
    });
  };

  return {
    vote,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    txHash: hash,
  };
}

/**
 * useCreateProposal Hook
 *
 * Create a new proposal (write operation)
 *
 * @example
 * ```tsx
 * const { createProposal, isPending, isSuccess } = useCreateProposal();
 *
 * const handleSubmit = () => {
 *   createProposal('Proposal Title', 'Proposal Description');
 * };
 * ```
 */
export function useCreateProposal() {
  const { chainId } = useWeb3Chain();
  const contractAddress = getVotingContractAddress(chainId);

  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createProposal = (title: string, description: string) => {
    if (!contractAddress) {
      console.error('Contract not deployed on this network');
      return;
    }

    writeContract({
      address: contractAddress,
      abi: EXAMPLE_VOTING_CONTRACT_ABI,
      functionName: 'createProposal',
      args: [title, description],
    });
  };

  return {
    createProposal,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    txHash: hash,
  };
}

/**
 * useWatchVoteEvents Hook
 *
 * Watch for VoteSubmitted events in real-time
 *
 * @param onVote - Callback function when a vote is submitted
 *
 * @example
 * ```tsx
 * useWatchVoteEvents((voter, proposalId) => {
 *   console.log(`${voter} voted on proposal ${proposalId}`);
 *   refetchProposal();
 * });
 * ```
 */
export function useWatchVoteEvents(
  onVote?: (voter: `0x${string}`, proposalId: bigint, timestamp: bigint) => void
) {
  const { chainId } = useWeb3Chain();
  const contractAddress = getVotingContractAddress(chainId);

  useWatchContractEvent({
    address: contractAddress,
    abi: EXAMPLE_VOTING_CONTRACT_ABI,
    eventName: 'VoteSubmitted',
    onLogs(logs) {
      logs.forEach((log) => {
        if (log.args.voter && log.args.proposalId && log.args.timestamp) {
          onVote?.(log.args.voter, log.args.proposalId, log.args.timestamp);
        }
      });
    },
  });
}

/**
 * useVotingContract Hook
 *
 * Complete hook that provides access to all voting contract functionality
 *
 * @example
 * ```tsx
 * const voting = useVotingContract();
 *
 * // Access different hooks
 * const { totalVotes } = voting.useTotalVotes();
 * const { proposal } = voting.useProposal(1);
 * const { vote } = voting.useSubmitVote();
 * ```
 */
export function useVotingContract() {
  const { chainId } = useWeb3Chain();
  const contractAddress = getVotingContractAddress(chainId);

  return {
    // Contract info
    contractAddress,
    chainId,

    // Read hooks
    useTotalVotes,
    useProposal,
    useHasVoted,
    useProposalBatch,

    // Write hooks
    useSubmitVote,
    useCreateProposal,

    // Event hooks
    useWatchVoteEvents,
  };
}

/**
 * useVoteWithRefetch Hook
 *
 * Vote and automatically refetch proposal data on success
 *
 * @param proposalId - The proposal ID to vote for
 * @param onSuccess - Optional callback on successful vote
 *
 * @example
 * ```tsx
 * const { vote, isPending, isSuccess } = useVoteWithRefetch(1, () => {
 *   console.log('Vote successful!');
 * });
 * ```
 */
export function useVoteWithRefetch(proposalId: number, onSuccess?: () => void) {
  const { vote, isPending, isConfirming, isSuccess, isError, txHash } = useSubmitVote();
  const { refetch: refetchProposal } = useProposal(proposalId);
  const { refetch: refetchTotal } = useTotalVotes();

  // Refetch data when vote is successful
  useEffect(() => {
    if (isSuccess) {
      refetchProposal();
      refetchTotal();
      onSuccess?.();
    }
  }, [isSuccess, refetchProposal, refetchTotal, onSuccess]);

  return {
    vote: () => vote(proposalId),
    isPending,
    isConfirming,
    isSuccess,
    isError,
    txHash,
  };
}
