/**
 * Vote on Poll Page
 *
 * Clean implementation using composition pattern and context.
 */
import { Suspense } from 'react';

import {
  VoteError,
  VoteGrid,
  VoteGridItem,
  VoteLoading,
  VotePageContent,
  VotePageLayout,
  VoteProvider,
  VoterList,
  VoterListSkeleton,
} from './components';

export default function VotePage() {
  return (
    <Suspense fallback={<VoteLoading />}>
      <VoteProvider>
        <VotePageLayout>
          <VoteGrid>
            <VoteGridItem>
              <VoteError />
              <VotePageContent />
            </VoteGridItem>

            <VoteGridItem>
              <Suspense fallback={<VoterListSkeleton />}>
                <VoterList />
              </Suspense>
            </VoteGridItem>
          </VoteGrid>
        </VotePageLayout>
      </VoteProvider>
    </Suspense>
  );
}
