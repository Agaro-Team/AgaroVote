/**
 * useVotingPolls Hook
 *
 * Hook for fetching voting polls with infinite scroll support
 * Uses centralized filter state management via useVotingPollsFilters
 */
import type { Poll } from '~/lib/api/poll/poll.interface';
import { pollInfiniteListQueryOptions } from '~/lib/query-client/poll/queries';

import { useInfiniteQuery } from '@tanstack/react-query';

import type { VotingPollCardProps } from '../components/voting-poll-card';
import { useVotingPollsFilters } from './use-voting-polls-filters';

/**
 * Maps Poll status to card status
 */
function mapPollStatus(poll: Poll): VotingPollCardProps['status'] {
  // Pending: hasn't started yet
  if (!poll.hasStarted) {
    return 'pending';
  }

  // Completed: has ended
  if (poll.hasEnded) {
    return 'completed';
  }

  // Active: ongoing and started but not ended
  if (poll.isOngoing && poll.hasStarted && !poll.hasEnded) {
    return 'active';
  }

  // Default to pending
  return 'pending';
}

/**
 * Transform API Poll to VotingPollCardProps
 */
function transformPollToCard(poll: Poll): VotingPollCardProps {
  return {
    id: poll.id,
    pollHash: poll.pollHash,
    title: poll.title,
    description: poll.description,
    choices: poll.choices.map((choice) => choice.choiceText),
    totalVotes: poll.voteCount, // TODO: Fetch from blockchain when implemented
    status: mapPollStatus(poll),
    createdAt: new Date(poll.createdAt),
    endsAt: new Date(poll.endDate),
  };
}

export function useVotingPolls() {
  // Use centralized filter state management
  const { filters } = useVotingPollsFilters();

  const queryResult = useInfiniteQuery(
    pollInfiniteListQueryOptions({
      limit: filters.limit,
      q: filters.q || undefined, // Only send if not empty
      sortBy: filters.sortBy,
      order: filters.order,
      isActive: filters.isActive,
    })
  );

  // Flatten all pages into a single array
  const polls =
    queryResult.data?.pages.flatMap((page) => page?.data?.data?.map(transformPollToCard) ?? []) ??
    [];

  // Get total from the first page
  const totalPolls = queryResult.data?.pages[0]?.data?.meta?.total ?? 0;

  return {
    polls,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    hasNextPage: queryResult.hasNextPage,
    fetchNextPage: queryResult.fetchNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    totalPolls,
    filters,
  };
}
