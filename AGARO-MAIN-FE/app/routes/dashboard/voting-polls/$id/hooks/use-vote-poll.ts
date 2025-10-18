import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';
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
  backendVoteId: string | null;
}

// Action types
type VotePollAction =
  | { type: 'SET_LOG'; payload: LogArgs }
  | { type: 'SET_COMMIT_TOKEN'; payload: string }
  | { type: 'SET_POLL_ID'; payload: string }
  | { type: 'SET_POLL_HASH'; payload: `0x${string}` }
  | { type: 'SET_CHOICE_ID'; payload: string }
  | { type: 'SET_CHOICE_INDEX'; payload: number }
  | { type: 'SET_BACKEND_VOTE_ID'; payload: string }
  | { type: 'RESET_VOTE_STATE' };

// Initial state
const initialState: VotePollState = {
  log: null,
  pollId: null,
  pollHash: null,
  choiceId: null,
  choiceIndex: null,
  backendVoteId: null,
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
    case 'SET_BACKEND_VOTE_ID':
      return { ...state, backendVoteId: action.payload };
    case 'RESET_VOTE_STATE':
      return initialState;
    default:
      return state;
  }
}

export function useVotePoll() {
  const { chainId } = useWeb3Chain();
  const { address: walletAddress } = useWeb3Wallet();

  const [state, dispatch] = useReducer(votePollReducer, initialState);

  // Backend mutation - Step 1: Register vote intent in backend
  const castVoteMutation = useMutation({
    ...castVoteMutationOptions,
    onSuccess: async (data) => {
      toast.success('Vote intent registered. Please confirm the transaction in your wallet.');

      // Store backend vote ID for later verification
      if (data?.data?.id) {
        dispatch({ type: 'SET_BACKEND_VOTE_ID', payload: data.data.id });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to register vote: ${error.message}`);
      dispatch({ type: 'RESET_VOTE_STATE' });
    },
  });

  // Blockchain mutation - Step 2: Submit transaction to blockchain
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

    // Step 1: Register vote intent in backend first
    castVoteMutation.mutate({
      pollId,
      choiceId,
      voterWalletAddress: walletAddress,
      commitToken: isNaN(Number(state.commitToken ?? 0)) ? undefined : Number(state.commitToken),
    });
  };

  // Step 2: After backend success, trigger blockchain transaction
  useEffect(() => {
    // Only proceed if backend mutation was successful and we have all required data
    if (!state.backendVoteId || !state.pollHash || state.choiceIndex === null) {
      return;
    }

    // Prevent duplicate blockchain submissions
    if (voteTxHash || isWritingEntryPointVote) {
      return;
    }

    const address = getEntryPointAddress(chainId);
    if (!address) {
      toast.error('EntryPoint contract not deployed on this network');
      return;
    }

    // Trigger blockchain transaction
    const args = {
      pollHash: state.pollHash,
      candidateSelected: state.choiceIndex,
      commitToken: BigInt(state.commitToken ?? 0),
      proofs: [], // Empty for now
    } as const;

    writeContract({
      address,
      args: [args],
    });
  }, [
    state.backendVoteId,
    state.pollHash,
    state.choiceIndex,
    state.commitToken,
    voteTxHash,
    isWritingEntryPointVote,
    writeContract,
    chainId,
  ]);

  // Step 3: After blockchain success and event emission, invalidate queries
  useEffect(() => {
    // Wait for all conditions to be met
    if (!isTransactionReceiptSuccess || !state.log || !voteTxHash || !state.pollId) {
      return;
    }

    // Verify the log matches our transaction
    if (!state.log.pollHash || !state.log.voter) {
      return;
    }

    // Verify the voter matches the wallet
    if (walletAddress && state.log.voter.toLowerCase() !== walletAddress.toLowerCase()) {
      toast.error('Voter address mismatch');
      return;
    }

    // All verifications passed - invalidate queries and show success
    toast.success('Vote successfully recorded on blockchain!');

    Promise.all([
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
    ]).then(() => {
      // Reset all state after successful completion
      dispatch({ type: 'RESET_VOTE_STATE' });
    });
  }, [isTransactionReceiptSuccess, state.log, state.pollId, voteTxHash, walletAddress]);

  // Handle receipt error
  useEffect(() => {
    if (receiptError) {
      const { title, description } = parseWagmiErrorForToast(receiptError);
      toast.error(title, { description });
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
    writeError,
    receiptError,
    resetWrite,
    choiceId: state.choiceId,
    choiceIndex: state.choiceIndex,
    pollId: state.pollId,
    pollHash: state.pollHash,
    backendVoteId: state.backendVoteId,
    onChainLog: state.log,
    setChoiceIndex: (index: number) => dispatch({ type: 'SET_CHOICE_INDEX', payload: index }),
    setPollId: (id: string) => dispatch({ type: 'SET_POLL_ID', payload: id }),
    setChoiceId: (id: string) => dispatch({ type: 'SET_CHOICE_ID', payload: id }),
    setCommitToken: (token: string) => dispatch({ type: 'SET_COMMIT_TOKEN', payload: token }),
    commitToken: state.commitToken,
  };
}
