/**
 * Vote on Poll Page
 *
 * Clean implementation using composition pattern and context.
 */
import { useParams } from 'react-router';
import { Spinner } from '~/components/ui/spinner';
import { pollDetailQueryOptions } from '~/lib/query-client/poll/queries';

import { useQuery } from '@tanstack/react-query';

import { VotePageContent, VotePageLayout } from './components';
import { VoteProvider } from './vote-context';

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const { data: poll, isLoading, error } = useQuery(pollDetailQueryOptions(id!));

  if (isLoading || !poll) {
    return (
      <VotePageLayout>
        <LoadingState />
      </VotePageLayout>
    );
  }

  if (error) {
    return (
      <VotePageLayout>
        <ErrorState />
      </VotePageLayout>
    );
  }

  return (
    <VoteProvider poll={poll}>
      <VotePageLayout>
        <VotePageContent />
      </VotePageLayout>
    </VoteProvider>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Spinner />
      <p className="text-muted-foreground">Loading poll details...</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <p className="text-destructive">Failed to load poll details</p>
    </div>
  );
}
