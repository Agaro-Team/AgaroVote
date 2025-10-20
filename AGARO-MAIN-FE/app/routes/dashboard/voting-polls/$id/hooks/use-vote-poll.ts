import { toast } from 'sonner';
import { parseEther } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';
import type { Poll } from '~/lib/api/poll/poll.interface';
import { queryClient } from '~/lib/query-client/config';
import { pollQueryKeys } from '~/lib/query-client/poll/queries';
import { castVoteMutationOptions } from '~/lib/query-client/vote/mutations';
import { voteQueryKeys } from '~/lib/query-client/vote/queries';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useWatchEntryPointVoteSucceededEvent,
  useWriteEntryPointVote,
} from '~/lib/web3/contracts/generated';
import { parseWagmiErrorForToast } from '~/lib/web3/error-parser';
import { createHexProofByLeaves } from '~/lib/web3/utils';

import { useEffect, useReducer } from 'react';

import { useMutation } from '@tanstack/react-query';

interface VoteParams {
  pollId: string;
  pollHash: `0x${string}`;
  candidateSelected: number;
  choiceId: string;
}

interface LogArgs {
  pollHash?: `0x${string}`;
  voter?: `0x${string}`;
  selected?: number;
  newPollVoterHash?: `0x${string}`;
}

// State interface
interface VotePollState {
  log: LogArgs | null;
  commitToken: string | null;
  pollId: string | null;
  pollHash: `0x${string}` | null;
  choiceId: string | null;
  choiceIndex: number | null;
  backendSubmitted: boolean;
}

// Action types
type VotePollAction =
  | { type: 'SET_LOG'; payload: LogArgs }
  | { type: 'SET_COMMIT_TOKEN'; payload: string }
  | { type: 'SET_POLL_ID'; payload: string }
  | { type: 'SET_POLL_HASH'; payload: `0x${string}` }
  | { type: 'SET_CHOICE_ID'; payload: string }
  | { type: 'SET_CHOICE_INDEX'; payload: number }
  | { type: 'SET_BACKEND_SUBMITTED'; payload: boolean }
  | { type: 'RESET_VOTE_STATE' };

// Initial state
const initialState: VotePollState = {
  log: null,
  pollId: null,
  pollHash: null,
  choiceId: null,
  choiceIndex: null,
  backendSubmitted: false,
  commitToken: null,
};

// Reducer function
function votePollReducer(state: VotePollState, action: VotePollAction): VotePollState {
  switch (action.type) {
    case 'SET_LOG':
      return { ...state, log: action.payload };
    case 'SET_COMMIT_TOKEN':
      return { ...state, commitToken: action.payload };
    case 'SET_POLL_ID':
      return { ...state, pollId: action.payload };
    case 'SET_POLL_HASH':
      return { ...state, pollHash: action.payload };
    case 'SET_CHOICE_ID':
      return { ...state, choiceId: action.payload };
    case 'SET_CHOICE_INDEX':
      return { ...state, choiceIndex: action.payload };
    case 'SET_BACKEND_SUBMITTED':
      return { ...state, backendSubmitted: action.payload };
    case 'RESET_VOTE_STATE':
      return initialState;
    default:
      return state;
  }
}

export function useVotePoll(poll: Poll) {
  const { chainId } = useWeb3Chain();
  const { address: walletAddress } = useWeb3Wallet();

  const [state, dispatch] = useReducer(votePollReducer, initialState);

  // Backend mutation - Step 2: Register vote after blockchain success
  const castVoteMutation = useMutation({
    ...castVoteMutationOptions,
    onSuccess: async () => {
      toast.success('Vote successfully recorded!');

      // Invalidate all relevant queries to refresh the UI
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: voteQueryKeys.baseUserVote,
        }),
        queryClient.invalidateQueries({
          queryKey: pollQueryKeys.baseVotingEligibility(),
        }),
        queryClient.invalidateQueries({
          queryKey: pollQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: voteQueryKeys.baseCheckHasVoted(),
        }),
        queryClient.invalidateQueries({
          queryKey: voteQueryKeys.baseUserVotes,
        }),
      ]).catch((error) => {
        console.error('Failed to invalidate queries:', error);
      });

      // Reset all state after successful completion
      dispatch({ type: 'RESET_VOTE_STATE' });
    },
    onError: (error: Error) => {
      toast.error('Failed to register vote in backend', {
        description: error.message,
      });
      // Don't reset state here - blockchain transaction succeeded
      // Just show the error, user can see the vote on blockchain
    },
  });

  // Blockchain mutation - Step 1: Submit transaction to blockchain
  const {
    writeContract,
    data: voteTxHash,
    isPending: isWritingEntryPointVote,
    error: writeError,
    reset: resetWrite,
  } = useWriteEntryPointVote({
    mutation: {
      onError: (error) => {
        // Parse the error and show user-friendly message
        const { title, description } = parseWagmiErrorForToast(error);
        toast.error(title, {
          description: description || 'Transaction failed. Please try again.',
        });
        // Reset local states on transaction error
        dispatch({ type: 'RESET_VOTE_STATE' });
      },
    },
  });

  // Wait for transaction confirmation
  const {
    isLoading: isTransactionReceiptLoading,
    isSuccess: isTransactionReceiptSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: voteTxHash,
    chainId,
  });

  useWatchEntryPointVoteSucceededEvent({
    address: getEntryPointAddress(chainId),
    chainId,
    onError: (error) => {
      toast.error(`Event watch error: ${error.message}`);
      dispatch({ type: 'RESET_VOTE_STATE' });
    },
    onLogs: (logs) => {
      if (logs.length === 0) return;

      // Only set the log on the last log
      const lastLog = logs[logs.length - 1];
      if (lastLog.args) {
        dispatch({ type: 'SET_LOG', payload: lastLog.args });
      }
    },
  });

  const vote = ({ pollHash, candidateSelected, choiceId, pollId }: VoteParams) => {
    const address = getEntryPointAddress(chainId);

    if (!poll) {
      toast.error('Poll not found');
      return;
    }

    if (!address) {
      toast.error('EntryPoint contract not deployed on this network');
      return;
    }

    if (!choiceId) {
      toast.error('Choice ID is required');
      return;
    }

    if (!walletAddress) {
      toast.error('Wallet not connected');
      return;
    }

    // Store vote parameters
    dispatch({ type: 'SET_CHOICE_ID', payload: choiceId });
    dispatch({ type: 'SET_POLL_ID', payload: pollId });
    dispatch({ type: 'SET_POLL_HASH', payload: pollHash });
    dispatch({ type: 'SET_CHOICE_INDEX', payload: candidateSelected });

    // Create Hex Proofs here
    let proofs: `0x${string}`[] = [];

    if (poll.addresses.length > 0) {
      proofs = createHexProofByLeaves(
        poll.addresses.map((address) => address.leaveHash),
        walletAddress
      );
    }

    // Trigger blockchain transaction
    const args = {
      pollHash: pollHash,
      candidateSelected: candidateSelected,
      commitToken: state.commitToken ? parseEther(state.commitToken) : parseEther('0'),
      proofs, // Empty for now
    } as const;

    writeContract({
      address,
      args: [args],
    });
  };

  // Step 2: After blockchain transaction success, submit to backend
  useEffect(() => {
    // Wait for transaction to be confirmed
    if (!isTransactionReceiptSuccess || !voteTxHash) {
      return;
    }

    // Verify we have all required data
    if (!state.pollId || !state.choiceId || !walletAddress) {
      console.error('Missing required data for backend submission');
      return;
    }

    // Check if already submitted or currently submitting to backend
    if (state.backendSubmitted || castVoteMutation.isPending || castVoteMutation.isSuccess) {
      return;
    }

    // Submit to backend after blockchain success
    toast.info('Recording vote in database...');

    castVoteMutation.mutate({
      pollId: state.pollId,
      choiceId: state.choiceId,
      voterWalletAddress: walletAddress as `0x${string}`,
      commitToken: isNaN(Number(state.commitToken ?? 0)) ? undefined : Number(state.commitToken),
    });
  }, [
    isTransactionReceiptSuccess,
    voteTxHash,
    state.pollId,
    state.choiceId,
    state.backendSubmitted,
    walletAddress,
    state.commitToken,
    castVoteMutation.isPending,
    castVoteMutation.isSuccess,
  ]);

  // Handle transaction receipt error
  useEffect(() => {
    if (receiptError) {
      const { title, description } = parseWagmiErrorForToast(receiptError);
      toast.error(title, {
        description: description || 'Transaction confirmation failed. Please try again.',
      });
      dispatch({ type: 'RESET_VOTE_STATE' });
    }
  }, [receiptError]);

  return {
    vote,
    isTransactionReceiptLoading,
    isTransactionReceiptSuccess,
    isWritingEntryPointVote,
    voteTxHash,
    isSubmittingToBackend: castVoteMutation.isPending,
    backendError: castVoteMutation.error,
    backendSuccess: castVoteMutation.isSuccess,
    writeError,
    receiptError,
    resetWrite,
    choiceId: state.choiceId,
    choiceIndex: state.choiceIndex,
    pollId: state.pollId,
    pollHash: state.pollHash,
    backendSubmitted: state.backendSubmitted,
    onChainLog: state.log,
    setChoiceIndex: (index: number) => dispatch({ type: 'SET_CHOICE_INDEX', payload: index }),
    setPollId: (id: string) => dispatch({ type: 'SET_POLL_ID', payload: id }),
    setChoiceId: (id: string) => dispatch({ type: 'SET_CHOICE_ID', payload: id }),
    setCommitToken: (token: string) => dispatch({ type: 'SET_COMMIT_TOKEN', payload: token }),
    commitToken: state.commitToken,
  };
}
