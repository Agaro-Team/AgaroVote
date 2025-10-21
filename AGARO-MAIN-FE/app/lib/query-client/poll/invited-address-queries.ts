import type { GetInvitedAddressesRequest } from '~/lib/api/poll/invited-address.interface';
import { invitedAddressService } from '~/lib/api/poll/invited-address.service';
import { createGetNextPageParam } from '~/lib/utils';

import { infiniteQueryOptions } from '@tanstack/react-query';

/**
 * Query keys for invited addresses
 */
export const invitedAddressQueryKeys = {
  base: () => ['invited-addresses'] as const,
  byPoll: (pollId: string) => [...invitedAddressQueryKeys.base(), 'poll', pollId] as const,
  infiniteListWithFilter: (pollId: string, params: GetInvitedAddressesRequest) =>
    [...invitedAddressQueryKeys.byPoll(pollId), 'infinite', params] as const,
};

/**
 * Infinite query options for invited addresses
 * Supports pagination, search, and sorting
 */
export const infiniteInvitedAddressesQueryOptions = (
  pollId: string,
  params: Omit<GetInvitedAddressesRequest, 'page'>
) =>
  infiniteQueryOptions({
    queryKey: invitedAddressQueryKeys.infiniteListWithFilter(pollId, params),
    queryFn: ({ pageParam = 1 }) =>
      invitedAddressService.getInvitedAddresses(pollId, {
        ...params,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: createGetNextPageParam(params.limit ?? 10),
    enabled: !!pollId,
  });
