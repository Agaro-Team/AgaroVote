/**
 * Vote on Poll Page
 *
 * Clean implementation using composition pattern and context.
 */
import { Suspense } from 'react';

import {
  VoteError,
  VoteLoading,
  VotePageContent,
  VotePageLayout,
  VoteProvider,
} from './components';

export default function VotePage() {
  return (
    <Suspense fallback={<VoteLoading />}>
      <VoteProvider>
        <VotePageLayout>
          <VoteError />
          <VotePageContent />
        </VotePageLayout>
      </VoteProvider>
    </Suspense>
  );
}
