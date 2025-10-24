/**
 * Vote Page Content - Composed voting page sections
 */
import { Spinner } from '~/components/ui/spinner';

import { Suspense } from 'react';

import { CommitTokenInput } from './commit-token-input';
import { InvitedAddressesList, InvitedAddressesListSkeleton } from './invited-addresses-list';
import { NonVotableAlert } from './non-votable-alert';
import { PollHashDisplay } from './poll-hash-display';
import { PollHeader } from './poll-header';
import { PollMeta } from './poll-meta';
import { VoteActions } from './vote-actions';
import { useVoteContext } from './vote-context';
import { VoteInfoCard } from './vote-info-card';
import { VoteError, VoteGrid, VoteGridItem } from './vote-page-layout';
import { VoteProgressTracker } from './vote-progress-tracker';
import { VoterList, VoterListSkeleton } from './voter-list';
import { VotingChoices } from './voting-choices';

export function VotePageContent() {
  const { errorPoll, isLoadingPoll, isLoadingUserVote } = useVoteContext();

  if (errorPoll) return null;

  const isLoading = isLoadingPoll || isLoadingUserVote;

  return (
    <div className="relative space-y-8">
      {/* Loading overlay - only shows when loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[3px] flex items-center justify-center z-50 animate-in fade-in duration-150">
          <Spinner />
        </div>
      )}

      <VoteError />
      <div className="space-y-4">
        <PollHeader />
        <PollMeta />
      </div>
      <PollHashDisplay />

      <VoteGrid>
        <VoteGridItem>
          <NonVotableAlert />
          <VotingChoices />
          <CommitTokenInput />
          <VoteActions />
          <VoteProgressTracker />
          <VoteInfoCard />
        </VoteGridItem>

        <VoteGridItem>
          <Suspense fallback={<VoterListSkeleton />}>
            <VoterList />
          </Suspense>

          <Suspense fallback={<InvitedAddressesListSkeleton />}>
            <InvitedAddressesList />
          </Suspense>
        </VoteGridItem>
      </VoteGrid>

      {/* Content - always visible */}
    </div>
  );
}
