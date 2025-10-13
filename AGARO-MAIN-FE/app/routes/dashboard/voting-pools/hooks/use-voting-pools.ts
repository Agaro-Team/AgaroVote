/**
 * useVotingPools Hook
 *
 * Hook for fetching voting pools with infinite scroll support
 * Uses centralized filter state management via useVotingPoolsFilters
 */
import type { Poll } from '~/lib/api/poll/poll.interface';
import { pollInfiniteListQueryOptions } from '~/lib/query-client/poll/queries';

import { useInfiniteQuery } from '@tanstack/react-query';

import type { VotingPoolCardProps } from '../components/voting-pool-card';
import { useVotingPoolsFilters } from './use-voting-pools-filters';

/**
 * Maps Poll status to card status
 */
function mapPollStatus(poll: Poll): VotingPoolCardProps['status'] {
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
 * Transform API Poll to VotingPoolCardProps
 */
function transformPollToCard(poll: Poll): VotingPoolCardProps {
  return {
    id: poll.id,
    poolHash: poll.poolHash,
    title: poll.title,
    description: poll.description,
    choices: poll.choices.map((choice) => choice.choiceText),
    totalVotes: poll.voteCount, // TODO: Fetch from blockchain when implemented
    status: mapPollStatus(poll),
    createdAt: new Date(poll.createdAt),
    endsAt: new Date(poll.endDate),
  };
}

export function useVotingPools() {
  // Use centralized filter state management
  const { filters } = useVotingPoolsFilters();

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
