/**
 * Voting Polls List Component
 *
 * Displays a list of voting polls with loading and empty states.
 */
import { FileQuestion, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { useVotingPolls } from '~/routes/dashboard/voting-polls/hooks/use-voting-polls';

import { VotingPollCard } from './voting-poll-card';

export function VotingPollsList() {
  const {
    polls,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    totalPolls,
  } = useVotingPolls();

  // Initial loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4 p-6 rounded-lg border">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Failed to load voting polls</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'There was an error loading the voting polls.'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (polls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No voting polls found</h3>
        <p className="text-sm text-muted-foreground">
          Be the first to create a voting poll and start voting!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Polls count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {polls.length} of {totalPolls} voting polls
        </p>
      </div>

      {/* Polls grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => (
          <VotingPollCard key={poll.pollHash} {...poll} />
        ))}
      </div>

      {/* Load more button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-w-[200px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && polls.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          You've reached the end of the list
        </p>
      )}
    </div>
  );
}
