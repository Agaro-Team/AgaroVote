/**
 * Vote Page Content - Composed voting page sections
 */
import { CommitTokenInput } from './commit-token-input';
import { NonVotableAlert } from './non-votable-alert';
import { PollHashDisplay } from './poll-hash-display';
import { PollHeader } from './poll-header';
import { PollMeta } from './poll-meta';
import { VoteActions } from './vote-actions';
import { VoteInfoCard } from './vote-info-card';
import { VoteProgressTracker } from './vote-progress-tracker';
import { VotingChoices } from './voting-choices';

export function VotePageContent() {
  return (
    <>
      <PollHeader />
      <PollMeta />
      <PollHashDisplay />
      <NonVotableAlert />
      <VotingChoices />
      <CommitTokenInput />
      <VoteActions />
      <VoteProgressTracker />
      <VoteInfoCard />
    </>
  );
}
