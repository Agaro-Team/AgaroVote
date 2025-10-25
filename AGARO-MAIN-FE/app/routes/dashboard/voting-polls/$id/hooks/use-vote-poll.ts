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

import { useEffect, useReducer, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import type { VoteError as VoteErrorType, VoteStep } from '../components/vote-progress-tracker';

/**
 * Custom Vote Error Class
 * Allows classification of errors by voting step
 */
export class VoteError extends Error {
  public readonly errorType: VoteErrorType;
  public readonly step: VoteStep;

  constructor(message: string, errorType: VoteErrorType, step: VoteStep) {
    super(message);
    this.name = 'VoteError';
    this.errorType = errorType;
    this.step = step;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VoteError);
    }
  }

  /**
   * Factory methods for creating specific vote errors
   */
  static databaseFailed(message: string = 'Failed to store vote data in database'): VoteError {
    return new VoteError(message, 'database-failed', 'database-storage');
  }

  static walletRejected(message: string = 'Wallet transaction was rejected'): VoteError {
    return new VoteError(message, 'wallet-rejected', 'wallet-confirmation');
  }

  static blockchainFailed(
    message: string = 'Failed to submit transaction to blockchain'
  ): VoteError {
    return new VoteError(message, 'blockchain-failed', 'blockchain-submission');
  }

  static unknownError(
    message: string = 'An unknown error occurred',
    step: VoteStep = 'blockchain-confirmation'
  ): VoteError {
    return new VoteError(message, 'unknown-error', step);
  }
}

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

  // Track vote errors
  const [voteError, setVoteError] = useState<VoteError | null>(null);

  // Backend mutation - Step 2: Register vote after blockchain success
  const castVoteMutation = useMutation({
    ...castVoteMutationOptions,
    onSuccess: async () => {
      dispatch({ type: 'SET_BACKEND_SUBMITTED', payload: true });
      // Proceed to vote on blockchain
      await voteToBlockChain();
    },
    onError: (error: Error) => {
      const voteErr = VoteError.databaseFailed(
        error.message || 'Failed to register vote in backend'
      );
      setVoteError(voteErr);
      toast.error(voteErr.message, {
        description: error.message,
      });
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
        const voteErr = VoteError.walletRejected(description || 'Transaction was rejected');
        setVoteError(voteErr);
        toast.error(title, {
          description: description || 'Transaction failed. Please try again.',
        });
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

  const voteToBlockChain = async () => {
    if (!walletAddress) {
      toast.error('Wallet not connected');
      return;
    }

    const address = getEntryPointAddress(chainId);
    if (!address) {
      toast.error('EntryPoint contract not deployed on this network');
      return;
    }

    // Create Hex Proofs here
    let proofs: `0x${string}`[] = [];

    if (poll.addresses.length > 0) {
      proofs = createHexProofByLeaves(
        poll.addresses.map((address) => address.leaveHash),
        walletAddress
      );
    }

    if (!state.pollHash || state.choiceIndex === null) {
      toast.error('Incomplete vote data');
      return;
    }

    // Trigger blockchain transaction
    const args = {
      pollHash: state.pollHash,
      candidateSelected: state.choiceIndex,
      commitToken: state.commitToken ? parseEther(state.commitToken) : parseEther('0'),
      proofs, // Empty for now
    } as const;

    writeContract({
      address,
      args: [args],
    });
  };

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

    castVoteMutation.mutate({
      pollId,
      choiceId,
      voterWalletAddress: walletAddress as `0x${string}`,
      commitToken: isNaN(Number(state.commitToken ?? 0)) ? undefined : Number(state.commitToken),
    });
  };

  // Step 2: After blockchain transaction success, invalidate relevant queries
  useEffect(() => {
    if (!isTransactionReceiptSuccess || !voteTxHash) return;
    toast.success('Vote successfully recorded!');

    // Invalidate all relevant queries to refresh the UI
    [
      voteQueryKeys.baseUserVote,
      pollQueryKeys.baseVotingEligibility(),
      pollQueryKeys.all,
      voteQueryKeys.baseCheckHasVoted(),
      voteQueryKeys.baseUserVotes,
    ].forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [isTransactionReceiptSuccess, voteTxHash]);

  // Handle transaction receipt error
  useEffect(() => {
    if (receiptError) {
      const { title, description } = parseWagmiErrorForToast(receiptError);
      const voteErr = VoteError.blockchainFailed(description || 'Transaction confirmation failed');
      setVoteError(voteErr);
      toast.error(title, {
        description: description || 'Transaction confirmation failed. Please try again.',
      });
    }
  }, [receiptError]);

  // Reset error when starting a new vote
  useEffect(() => {
    if (isWritingEntryPointVote) {
      setVoteError(null);
    }
  }, [isWritingEntryPointVote]);

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
    voteError, // Export the VoteError instance
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
