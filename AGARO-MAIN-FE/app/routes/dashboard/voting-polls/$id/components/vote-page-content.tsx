/**
 * Vote Page Content - Composed voting page sections
 */
import { CommitTokenInput } from './commit-token-input';
import { NonVotableAlert } from './non-votable-alert';
import { PollHashDisplay } from './poll-hash-display';
import { PollHeader } from './poll-header';
import { PollMeta } from './poll-meta';
import { PollRewardStatus } from './poll-reward-status';
import { VoteActions } from './vote-actions';
import { useVoteContext } from './vote-context';
import { VoteInfoCard } from './vote-info-card';
import { VoteProgressTracker } from './vote-progress-tracker';
import { VotingChoices } from './voting-choices';

export function VotePageContent() {
  const { errorPoll } = useVoteContext();
  if (errorPoll) return null;

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

      {/* Reward Status Section */}
      <div className="mt-8">
        <PollRewardStatus
          pollId="101"
          pollStatus="active"
          pollEndTime={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
          hasVoted={true}
          userVote="React"
          voteTimestamp={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
          rewardAmount="45.67"
          rewardStatus="locked"
        />
      </div>
    </>
  );
}
