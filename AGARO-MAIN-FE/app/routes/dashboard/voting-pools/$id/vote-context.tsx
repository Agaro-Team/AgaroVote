/**
 * Vote Context - Manages voting state and logic
 */
import type { Poll } from '~/lib/api/poll/poll.interface';

import { type ReactNode, createContext, useContext, useState } from 'react';

interface VoteContextValue {
  poll: Poll;
  selectedChoiceId: string | null;
  isVoting: boolean;
  canVote: boolean;
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
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const canVote = poll.isOngoing;

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
    selectChoice: setSelectedChoiceId,
    submitVote: handleSubmitVote,
  };

  return <VoteContext.Provider value={value}>{children}</VoteContext.Provider>;
}
