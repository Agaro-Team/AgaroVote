/**
 * useVotingPools Hook
 *
 * Hook for fetching active voting pools with infinite scroll support
 * Uses URL state for limit parameter
 */
import { parseAsInteger, useQueryState } from 'nuqs';
import type { Poll } from '~/lib/api/poll/poll.interface';
import { pollInfiniteListQueryOptions } from '~/lib/query-client/poll/queries';

import { useInfiniteQuery } from '@tanstack/react-query';

import type { VotingPoolCardProps } from '../../components/voting-pools/voting-pool-card';

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
    poolHash: poll.poolHash,
    title: poll.title,
    description: poll.description,
    choices: poll.choices.map((choice) => choice.choiceText),
    totalVotes: 0, // TODO: Fetch from blockchain when implemented
    status: mapPollStatus(poll),
    createdAt: new Date(poll.createdAt),
    endsAt: new Date(poll.endDate),
  };
}

export function useVotingPools() {
  // Use URL state for limit parameter
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(9));

  const queryResult = useInfiniteQuery(
    pollInfiniteListQueryOptions({
      limit,
      isActive: true,
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
    limit,
  };
}
