import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain } from '~/hooks/use-web3';
import { useWeb3Wallet } from '~/hooks/use-web3';
import { queryClient, queryKeys } from '~/lib/query-client/config';
import { pollQueryKeys } from '~/lib/query-client/poll/queries';
import { castVoteMutationOptions } from '~/lib/query-client/vote/mutations';
import { voteQueryKeys } from '~/lib/query-client/vote/queries';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useWatchEntryPointVoteSucceededEvent,
  useWriteEntryPointVote,
} from '~/lib/web3/contracts/generated';
import { parseWagmiErrorForToast } from '~/lib/web3/error-parser';

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
  choiceId: string | null;
  choiceIndex: number | null;
  hasSubmittedToBackend: boolean;
}

// Action types
type VotePollAction =
  | { type: 'SET_LOG'; payload: LogArgs }
  | { type: 'SET_COMMIT_TOKEN'; payload: string }
  | { type: 'SET_POLL_ID'; payload: string }
  | { type: 'SET_CHOICE_ID'; payload: string }
  | { type: 'SET_CHOICE_INDEX'; payload: number }
  | { type: 'SET_HAS_SUBMITTED_TO_BACKEND'; payload: boolean }
  | { type: 'RESET_VOTE_STATE' }
  | { type: 'RESET_TRANSACTION_STATE' };

// Initial state
const initialState: VotePollState = {
  log: null,
  pollId: null,
  choiceId: null,
  choiceIndex: null,
  hasSubmittedToBackend: false,
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
    case 'SET_CHOICE_ID':
      return { ...state, choiceId: action.payload };
    case 'SET_CHOICE_INDEX':
      return { ...state, choiceIndex: action.payload };
    case 'SET_HAS_SUBMITTED_TO_BACKEND':
      return { ...state, hasSubmittedToBackend: action.payload };
    case 'RESET_VOTE_STATE':
      return {
        ...state,
        log: null,
        commitToken: null,
        pollId: null,
        choiceId: null,
        hasSubmittedToBackend: false,
      };
    case 'RESET_TRANSACTION_STATE':
      return {
        ...state,
        commitToken: null,
        pollId: null,
        choiceId: null,
        log: null,
      };
    default:
      return state;
  }
}

export function useVotePoll() {
  const { chainId } = useWeb3Chain();
  const { address: walletAddress } = useWeb3Wallet();

  const [state, dispatch] = useReducer(votePollReducer, initialState);

  const castVoteMutation = useMutation({
    ...castVoteMutationOptions,
    onSuccess: async () => {
      toast.success('Vote successfully recorded!');

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
      ]);

      // Reset states after successful submission
      dispatch({ type: 'RESET_VOTE_STATE' });
    },
    onError: (error: Error) => {
      toast.error(`Failed to record vote: ${error.message}`);
      dispatch({ type: 'SET_HAS_SUBMITTED_TO_BACKEND', payload: false });
    },
  });

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
        toast.error(title, { description });
        // Reset local states on transaction error
        dispatch({ type: 'RESET_TRANSACTION_STATE' });
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
  });

  useWatchEntryPointVoteSucceededEvent({
    address: getEntryPointAddress(chainId),
    enabled: isTransactionReceiptSuccess && !state.hasSubmittedToBackend,
    onError: (error) => {
      toast.error(`Event watch error: ${error.message}`);
      dispatch({ type: 'RESET_TRANSACTION_STATE' });
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

    if (!address) {
      toast.error('EntryPoint contract not deployed on this network');
      return;
    }

    if (!choiceId) {
      toast.error('Choice ID is required');
      return;
    }

    dispatch({ type: 'SET_CHOICE_ID', payload: choiceId });
    dispatch({ type: 'SET_POLL_ID', payload: pollId });

    const args = {
      pollHash: pollHash,
      candidateSelected,
      commitToken: BigInt(state.commitToken ?? 0),
      proofs: [], // Empty for now
    } as const;

    writeContract({
      address,
      args: [args],
    });
  };

  useEffect(() => {
    // Prevent duplicate submissions
    if (state.hasSubmittedToBackend || castVoteMutation.isPending) {
      return;
    }

    // Validate all required data is present
    if (!state.log || !state.log.pollHash || !state.log.voter || !walletAddress) {
      return;
    }

    if (!state.choiceId || !state.pollId || !voteTxHash || !isTransactionReceiptSuccess) {
      return;
    }

    // Verify the voter matches the wallet
    if (state.log.voter.toLowerCase() !== walletAddress.toLowerCase()) {
      toast.error('Voter address mismatch');
      return;
    }

    // Submit to backend
    dispatch({ type: 'SET_HAS_SUBMITTED_TO_BACKEND', payload: true });
    castVoteMutation.mutate({
      pollId: state.pollId,
      choiceId: state.choiceId,
      voterWalletAddress: walletAddress,
      transactionHash: voteTxHash,
      commitToken: isNaN(Number(state.commitToken ?? 0)) ? undefined : Number(state.commitToken),
    });
  }, [
    isTransactionReceiptSuccess,
    state.pollId,
    state.choiceId,
    state.log,
    state.hasSubmittedToBackend,
    voteTxHash,
    walletAddress,
    castVoteMutation,
  ]);

  // Handle receipt error
  useEffect(() => {
    if (receiptError) {
      const { title, description } = parseWagmiErrorForToast(receiptError);
      toast.error(title, { description });
      dispatch({ type: 'RESET_TRANSACTION_STATE' });
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
    writeError,
    receiptError,
    resetWrite,
    choiceId: state.choiceId,
    choiceIndex: state.choiceIndex,
    pollId: state.pollId,
    onChainLog: state.log,
    setChoiceIndex: (index: number) => dispatch({ type: 'SET_CHOICE_INDEX', payload: index }),
    setPollId: (id: string) => dispatch({ type: 'SET_POLL_ID', payload: id }),
    setChoiceId: (id: string) => dispatch({ type: 'SET_CHOICE_ID', payload: id }),
    setCommitToken: (token: string) => dispatch({ type: 'SET_COMMIT_TOKEN', payload: token }),
    commitToken: state.commitToken,
  };
}
