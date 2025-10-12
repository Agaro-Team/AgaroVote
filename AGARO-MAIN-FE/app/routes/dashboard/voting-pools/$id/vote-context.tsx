/**
 * Vote Context - Manages voting state and logic
 */
import { toast } from 'sonner';
import { useWeb3Wallet } from '~/hooks/use-web3';
import type { Poll } from '~/lib/api/poll/poll.interface';
import { formatDate } from '~/lib/date-utils';

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useVotePoll } from './hooks/use-vote-poll';

interface VoteContextValue {
  poll: Poll;
  selectedChoiceIndex: number | null;
  isVoting: boolean;
  canVote: boolean;
  nonVotableReason: string | null;
  selectChoice: (choiceIndex: number) => void;
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
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);

  const votePool = useVotePoll();

  const handleSubmitVote = async () => {
    if (typeof selectedChoiceIndex !== 'number' || !canVote) return;
    if (!poll) return;

    votePool.vote(poll.poolHash, selectedChoiceIndex);
  };

  const invitedAddresses = poll.addresses?.map((address) => address.walletAddress) || [];

  const canVote = useMemo(() => {
    if (poll.hasEnded) return false;
    if (!poll.hasStarted) return false;
    if (!walletAddress) return false;

    if (invitedAddresses.length > 0 && !invitedAddresses.includes(walletAddress)) {
      return false;
    }

    return poll.isOngoing;
  }, [poll, walletAddress, invitedAddresses]);

  const nonVotableReason = useMemo(() => {
    if (poll.hasEnded) {
      return 'Voting has closed for this poll.';
    }
    if (!poll.hasStarted) {
      return `Voting will start on ${formatDate(poll.startDate, 'DD MMM YYYY')}.`;
    }

    if (!walletAddress) {
      return 'You are not connected to a wallet.';
    }

    if (invitedAddresses.length > 0 && !invitedAddresses.includes(walletAddress)) {
      return 'You are not allowed to vote for this poll. Only invited addresses can vote.';
    }

    return null;
  }, [poll, walletAddress, invitedAddresses]);

  const value: VoteContextValue = {
    poll,
    selectedChoiceIndex,
    isVoting: votePool.isWritingEntryPointVote,
    canVote,
    nonVotableReason: nonVotableReason || null,
    selectChoice: setSelectedChoiceIndex,
    submitVote: handleSubmitVote,
  };

  useEffect(() => {
    if (votePool.isTransactionReceiptSuccess) {
      toast.success('Vote submitted successfully');
    }
  }, [votePool.isTransactionReceiptSuccess]);

  return <VoteContext.Provider value={value}>{children}</VoteContext.Provider>;
}
