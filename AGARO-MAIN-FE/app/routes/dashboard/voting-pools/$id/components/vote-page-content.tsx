/**
 * Vote Page Content - Composed voting page sections
 */
import { NonVotableAlert } from './non-votable-alert';
import { PollHeader } from './poll-header';
import { PollMeta } from './poll-meta';
import { PoolHashDisplay } from './pool-hash-display';
import { VoteActions } from './vote-actions';
import { VoteInfoCard } from './vote-info-card';
import { VoteProgressTracker } from './vote-progress-tracker';
import { VotingChoices } from './voting-choices';

export function VotePageContent() {
  return (
    <>
      <PollHeader />
      <PollMeta />
      <PoolHashDisplay />
      <NonVotableAlert />
      <VotingChoices />
      <VoteActions />
      <VoteProgressTracker />
      <VoteInfoCard />
    </>
  );
}
