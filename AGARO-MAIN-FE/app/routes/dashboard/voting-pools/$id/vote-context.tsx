/**
 * Vote Context - Manages voting state and logic
 */
import { toast } from 'sonner';
import { useWeb3Wallet } from '~/hooks/use-web3';
import type { Poll } from '~/lib/api/poll/poll.interface';
import { votingEligibilityQueryOptions } from '~/lib/query-client/poll/queries';
import { userVoteQueryOptions } from '~/lib/query-client/vote/queries';

import { type ReactNode, createContext, useContext, useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useVotePoll } from './hooks/use-vote-poll';

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
  selectChoice: (choiceIndex: number, choiceId: string) => void;
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
  poll: Poll;
  children: ReactNode;
}

export function VoteProvider({ poll, children }: VoteProviderProps) {
  const { address: walletAddress } = useWeb3Wallet();
  const votePool = useVotePoll();

  // Fetch voting eligibility from the backend
  const { data: eligibilityData, isLoading: isCheckingEligibility } = useQuery(
    votingEligibilityQueryOptions(poll.id, walletAddress!)
  );

  // Fetch user's vote for this poll
  const {
    data: userVoteData,
    isLoading: isLoadingUserVote,
    refetch: refetchUserVote,
  } = useQuery(userVoteQueryOptions(poll.id, walletAddress!));

  const hasVoted = !!userVoteData;
  const userVotedChoiceId = userVoteData?.data?.choiceId ?? null;

  // Determine if user can vote (eligible AND hasn't voted yet)
  const canVote = useMemo(() => {
    if (!eligibilityData) return false;
    return eligibilityData.data?.eligible ?? false;
  }, [eligibilityData?.data?.eligible]);

  // Determine non-votable reason
  const nonVotableReason = useMemo(() => {
    if (hasVoted) {
      return 'You have already voted in this poll.';
    }
    return eligibilityData?.data?.reason ?? null;
  }, [hasVoted, eligibilityData?.data?.reason]);

  const handleSubmitVote = async () => {
    if (typeof votePool.choiceIndex !== 'number' || !canVote) return;
    if (!poll) return;
    if (!votePool.choiceId) return;

    votePool.vote({
      poolHash: poll.poolHash,
      poolId: poll.id,
      candidateSelected: votePool.choiceIndex,
      choiceId: votePool.choiceId,
    });
  };

  const value: VoteContextValue = {
    poll,
    selectedChoiceIndex: votePool.choiceIndex,
    isVoting: votePool.isWritingEntryPointVote,
    canVote,
    nonVotableReason: nonVotableReason || null,
    isCheckingEligibility,
    hasVoted,
    userVotedChoiceId,
    isLoadingUserVote,
    selectChoice: (choiceIndex, choiceId) => {
      // Prevent selection if user has already voted
      if (hasVoted) {
        toast.error('You have already voted in this poll');
        return;
      }

      if (choiceIndex === votePool.choiceIndex && choiceId === votePool.choiceId) {
        return;
      }

      votePool.setChoiceIndex(choiceIndex);
      votePool.setChoiceId(choiceId);
    },
    submitVote: handleSubmitVote,
  };

  // Refetch user vote after successful vote submission
  useEffect(() => {
    if (votePool.isTransactionReceiptSuccess) {
      // Refetch user vote to update the UI
      setTimeout(() => {
        refetchUserVote();
      }, 1000); // Small delay to ensure backend has processed the vote
    }
  }, [votePool.isTransactionReceiptSuccess, refetchUserVote]);

  return <VoteContext.Provider value={value}>{children}</VoteContext.Provider>;
}
