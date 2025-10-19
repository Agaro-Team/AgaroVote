import type { Address } from 'viem';
import type { GetUserVote, GetUserVotesRequest } from '~/lib/api/vote/vote.interface';
import { voteService } from '~/lib/api/vote/vote.service';
import { createGetNextPageParam } from '~/lib/utils';

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

export const voteQueryKeys = {
  baseUserVote: ['user-vote'] as const,
  userVote: (pollId: string, walletAddress: Address) =>
    [...voteQueryKeys.baseUserVote, { pollId, walletAddress }] as const,
  baseCheckHasVoted: () => [...voteQueryKeys.baseUserVote, 'check-has-voted'] as const,
  checkHasVoted: (pollId: string, walletAddress: Address) =>
    [...voteQueryKeys.baseCheckHasVoted(), { pollId, walletAddress }] as const,

  baseUserVotes: ['user-votes'] as const,
  userVotes: (params: GetUserVotesRequest) => [...voteQueryKeys.baseUserVotes, { params }] as const,
};

export const userVoteQueryOptions = (pollId: string, walletAddress: Address) =>
  queryOptions({
    queryKey: voteQueryKeys.userVote(pollId, walletAddress!),
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }

      return await voteService.getUserVote({
        pollId,
        voterWalletAddress: walletAddress,
      });
    },
    enabled: !!pollId && !!walletAddress,
  });

export const infiniteUserVotesQueryOptions = (params: GetUserVotesRequest) =>
  infiniteQueryOptions({
    queryKey: voteQueryKeys.userVotes(params),
    queryFn: () => voteService.getUserVotes(params),
    getNextPageParam: createGetNextPageParam(params.limit ?? 10),
    initialPageParam: 1,
    select: (data) => {
      return data.pages.flatMap((page) => page?.data?.data ?? []) as GetUserVote[];
    },
  });

export const checkHasVotedQueryOptions = (pollId: string, walletAddress: Address) =>
  queryOptions({
    queryKey: voteQueryKeys.checkHasVoted(pollId, walletAddress!),
    queryFn: async () => {
      return await voteService.checkHasVoted({
        pollId,
        voterWalletAddress: walletAddress,
      });
    },
    enabled: !!pollId && !!walletAddress,
  });
