/**
 * Vote Page Content - Composed voting page sections
 */
import { Spinner } from '~/components/ui/spinner';

import { CommitTokenInput } from './commit-token-input';
import { NonVotableAlert } from './non-votable-alert';
import { PollHashDisplay } from './poll-hash-display';
import { PollHeader } from './poll-header';
import { PollMeta } from './poll-meta';
import { VoteActions } from './vote-actions';
import { useVoteContext } from './vote-context';
import { VoteInfoCard } from './vote-info-card';
import { VoteProgressTracker } from './vote-progress-tracker';
import { VotingChoices } from './voting-choices';

export function VotePageContent() {
  const { errorPoll, isLoadingPoll, isLoadingUserVote } = useVoteContext();

  if (errorPoll) return null;

  const isLoading = isLoadingPoll || isLoadingUserVote;

  return (
    <div className="relative space-y-6">
      {/* Loading overlay - only shows when loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-50 animate-in fade-in duration-150">
          <Spinner />
        </div>
      )}

      {/* Content - always visible */}
      <PollHeader />
      <PollMeta />
      <PollHashDisplay />
      <NonVotableAlert />
      <VotingChoices />
      <CommitTokenInput />
      <VoteActions />
      <VoteProgressTracker />
      <VoteInfoCard />
    </div>
  );
}
