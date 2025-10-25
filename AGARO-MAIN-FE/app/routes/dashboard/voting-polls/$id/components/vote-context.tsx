/**
 * Vote Context - Manages voting state and logic
 */
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { useWeb3Wallet } from '~/hooks/use-web3';
import type { Poll } from '~/lib/api/poll/poll.interface';
import {
  pollDetailQueryOptions,
  votingEligibilityQueryOptions,
} from '~/lib/query-client/poll/queries';
import { checkHasVotedQueryOptions, userVoteQueryOptions } from '~/lib/query-client/vote/queries';

import { type ReactNode, createContext, useContext, useEffect, useMemo } from 'react';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { VoteError, useVotePoll } from '../hooks/use-vote-poll';
import type { VoteStep } from './vote-progress-tracker';

// Re-export VoteError for convenience
export { VoteError };

interface VoteContextValue {
  poll: Poll;
  selectedChoiceIndex: number | null;
  isVoting: boolean;
  canVote: boolean;
  nonVotableReason: string | null;
  isCheckingEligibility: boolean;
  hasVoted: boolean;
  userVotedChoiceId: string | null;
  isLoadingUserVote: boolean;
  currentVoteStep: VoteStep;
  voteTxHash: `0x${string}` | undefined;
  commitToken: string | null;
  errorPoll: Error | null;
  isLoadingPoll: boolean;
  voteError: VoteError | null;
  selectChoice: (choiceIndex: number, choiceId: string) => void;
  setCommitToken: (token: string) => void;
  submitVote: () => Promise<void>;
}

const VoteContext = createContext<VoteContextValue | null>(null);

export function useVoteContext() {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error('useVoteContext must be used within VoteProvider');
  }
  return context;
}

interface VoteProviderProps {
  children: ReactNode;
}

export function VoteProvider({ children }: VoteProviderProps) {
  const { id } = useParams<{ id: string }>();
  const {
    data: poll,
    isLoading: isLoadingPoll,
    error: errorPoll,
  } = useSuspenseQuery(pollDetailQueryOptions(id!));

  const { address: walletAddress } = useWeb3Wallet();
  const votePoll = useVotePoll(poll);

  // Fetch voting eligibility from the backend
  const { data: eligibilityData, isLoading: isCheckingEligibility } = useQuery(
    votingEligibilityQueryOptions(poll.id, walletAddress!)
  );

  const { data: hasVotedData } = useQuery(checkHasVotedQueryOptions(poll.id, walletAddress!));

  // Fetch user's vote for this poll
  const {
    data: userVoteData,
    isLoading: isLoadingUserVote,
    refetch: refetchUserVote,
  } = useQuery({
    ...userVoteQueryOptions(poll.id, walletAddress!),
    enabled: !!poll.id && !!walletAddress && !!hasVotedData?.data?.hasVoted,
  });

  const hasVoted = !!userVoteData || hasVotedData?.data?.hasVoted;
  const userVotedChoiceId = userVoteData?.data?.choiceId ?? null;

  // Determine if user can vote (eligible AND hasn't voted yet)
  const canVote = useMemo(() => {
    if (!eligibilityData) return false;
    return eligibilityData.data?.eligible ?? false;
  }, [eligibilityData?.data?.eligible]);

  // Determine current voting step based on transaction state
  const currentVoteStep = useMemo<VoteStep>(() => {
    // If wallet confirmation is pending
    if (votePoll.isWritingEntryPointVote) {
      return 'wallet-confirmation';
    }

    // If transaction hash exists but not confirmed yet
    if (votePoll.voteTxHash && !votePoll.isTransactionReceiptSuccess) {
      if (votePoll.isTransactionReceiptLoading) {
        return 'blockchain-confirmation';
      }
      return 'blockchain-submission';
    }

    // If transaction is confirmed and submitting to backend
    if (votePoll.isTransactionReceiptSuccess && votePoll.isSubmittingToBackend) {
      return 'database-storage';
    }

    // If backend submission was successful
    if (votePoll.backendSuccess) {
      return 'complete';
    }

    // Default: idle state
    return 'idle';
  }, [
    votePoll.isWritingEntryPointVote,
    votePoll.voteTxHash,
    votePoll.isTransactionReceiptSuccess,
    votePoll.isTransactionReceiptLoading,
    votePoll.isSubmittingToBackend,
    votePoll.backendSuccess,
  ]);

  // Determine non-votable reason
  const nonVotableReason = useMemo(() => {
    if (hasVoted) {
      return 'You have already voted in this poll.';
    }
    return eligibilityData?.data?.reason ?? null;
  }, [hasVoted, eligibilityData?.data?.reason]);

  const handleSubmitVote = async () => {
    if (typeof votePoll.choiceIndex !== 'number' || !canVote) return;
    if (!poll) return;
    if (!votePoll.choiceId) return;

    try {
      votePoll.vote({
        pollHash: poll.pollHash,
        pollId: poll.id,
        candidateSelected: votePoll.choiceIndex,
        choiceId: votePoll.choiceId,
      });
    } catch (error) {
      // Errors are already handled in the useVotePoll hook
      console.error('Vote submission error:', error);
    }
  };

  const value: VoteContextValue = {
    poll,
    selectedChoiceIndex: votePoll.choiceIndex,
    isVoting:
      votePoll.isSubmittingToBackend ||
      votePoll.isWritingEntryPointVote ||
      votePoll.isTransactionReceiptLoading,
    canVote,
    nonVotableReason: nonVotableReason || null,
    isCheckingEligibility,
    hasVoted: hasVoted || false,
    userVotedChoiceId,
    isLoadingUserVote,
    currentVoteStep,
    voteTxHash: votePoll.voteTxHash,
    errorPoll,
    isLoadingPoll,
    voteError: votePoll.voteError, // Get voteError from hook
    selectChoice: (choiceIndex, choiceId) => {
      // Prevent selection if user has already voted
      if (hasVoted) {
        toast.error('You have already voted in this poll');
        return;
      }

      if (choiceIndex === votePoll.choiceIndex && choiceId === votePoll.choiceId) {
        return;
      }

      votePoll.setChoiceIndex(choiceIndex);
      votePoll.setChoiceId(choiceId);
    },
    submitVote: handleSubmitVote,
    commitToken: votePoll.commitToken,
    setCommitToken: votePoll.setCommitToken,
  };

  // Refetch user vote after successful vote submission
  useEffect(() => {
    if (votePoll.isTransactionReceiptSuccess) {
      // Refetch user vote to update the UI
      setTimeout(() => {
        refetchUserVote();
      }, 1000); // Small delay to ensure backend has processed the vote
    }
  }, [votePoll.isTransactionReceiptSuccess, refetchUserVote]);

  useEffect(() => {
    if (userVoteData && userVoteData.data?.commitToken) {
      votePoll.setCommitToken(userVoteData.data.commitToken.toString());
    }
  }, [userVoteData]);

  return <VoteContext.Provider value={value}>{children}</VoteContext.Provider>;
}
