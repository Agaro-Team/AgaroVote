/**
 * Vote Context - Manages voting state and logic
 */
import { useWeb3Wallet } from '~/hooks/use-web3';
import type { Poll } from '~/lib/api/poll/poll.interface';
import { formatDate } from '~/lib/date-utils';

import { type ReactNode, createContext, useContext, useMemo, useState } from 'react';

interface VoteContextValue {
  poll: Poll;
  selectedChoiceId: string | null;
  isVoting: boolean;
  canVote: boolean;
  nonVotableReason: string | null;
  selectChoice: (choiceId: string) => void;
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
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

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

  const handleSubmitVote = async () => {
    if (!selectedChoiceId || !canVote) return;

    setIsVoting(true);
    try {
      // TODO: Implement Web3 voting transaction
      console.log('Voting for choice:', selectedChoiceId);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Voting error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const value: VoteContextValue = {
    poll,
    selectedChoiceId,
    isVoting,
    canVote,
    nonVotableReason: nonVotableReason || null,
    selectChoice: setSelectedChoiceId,
    submitVote: handleSubmitVote,
  };

  return <VoteContext.Provider value={value}>{children}</VoteContext.Provider>;
}
