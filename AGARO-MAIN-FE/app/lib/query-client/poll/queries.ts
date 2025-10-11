import type { GetPollsRequest } from '~/lib/api/poll/poll.interface';
import { pollService } from '~/lib/api/poll/poll.service';

import { infiniteQueryOptions } from '@tanstack/react-query';

export const pollQueryKeys = {
  all: ['poll'] as const,
  activeList: () => [...pollQueryKeys.all, 'active-list'] as const,
  activeListWithFilter: (params: Omit<GetPollsRequest, 'page'>) =>
    [...pollQueryKeys.activeList(), 'filters', params] as const,
  details: (id: string) => [...pollQueryKeys.all, 'details', id] as const,
};

export const pollInfiniteListQueryOptions = (params: Omit<GetPollsRequest, 'page'>) =>
  infiniteQueryOptions({
    queryKey: pollQueryKeys.activeListWithFilter(params),
    queryFn: ({ pageParam = 1 }) =>
      pollService.getActivePolls({
        ...params,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil((lastPage?.data?.meta?.total ?? 0) / (params.limit ?? 9));
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
