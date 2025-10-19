import type { GetRewardsRequest } from '~/lib/api/reward/reward.interface';
import { rewardService } from '~/lib/api/reward/reward.service';

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

export const rewardQueryKeys = {
  all: ['reward'] as const,
  list: () => [...rewardQueryKeys.all, 'list'] as const,
  listWithFilter: (params: GetRewardsRequest) =>
    [...rewardQueryKeys.list(), 'filters', params] as const,
  infiniteList: () => [...rewardQueryKeys.all, 'infinite-list'] as const,
  infiniteListWithFilter: (params: GetRewardsRequest) =>
    [...rewardQueryKeys.infiniteList(), 'filters', params] as const,

  dashboardSummary: () => [...rewardQueryKeys.all, 'dashboard-summary'] as const,
};

export const rewardListQueryOptions = (params: GetRewardsRequest) =>
  queryOptions({
    queryKey: rewardQueryKeys.listWithFilter(params),
    queryFn: () => rewardService.getRewards(params),
  });

export const infiniteRewardListQueryOptions = (params: GetRewardsRequest) =>
  infiniteQueryOptions({
    queryKey: rewardQueryKeys.infiniteListWithFilter(params),
    queryFn: ({ pageParam = 1 }) => rewardService.getRewards({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      // Safely access the nested data structure
      if (!lastPage?.data?.meta) return undefined;

      const currentPage = allPages?.length ?? 0;
      const totalPages = Math.ceil(lastPage.data.meta.total / (lastPage.data.meta.limit || 9));
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    select: (data) => {
      // Handle case where there are no pages yet
      if (!data?.pages || data?.pages?.length === 0) {
        return {
          rewards: [],
          total: 0,
          page: 1,
          limit: params.limit ?? 9,
        };
      }

      // Safely flatten all rewards from all pages
      const rewards = data.pages.flatMap((page) => {
        // Check if page has the expected structure
        if (!page?.data?.data) return [];
        return page.data.data;
      });

      // Get meta info from the last page
      const lastPage = data.pages[data.pages.length - 1];

      return {
        rewards,
        total: lastPage?.data?.meta?.total ?? 0,
        page: lastPage?.data?.meta?.page ?? 1,
        limit: lastPage?.data?.meta?.limit ?? params.limit ?? 9,
      };
    },
  });

export const rewardDashboardSummaryQueryOptions = queryOptions({
  queryKey: rewardQueryKeys.dashboardSummary(),
  queryFn: () => rewardService.getDashboardRewardSummary(),
  refetchInterval: 20000,
  refetchOnMount: true,
  select: (data) => data?.data ?? undefined,
});
