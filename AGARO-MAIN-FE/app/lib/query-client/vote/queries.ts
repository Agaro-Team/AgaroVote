import type { Address } from 'viem';
import { pollService } from '~/lib/api/poll/poll.service';
import { voteService } from '~/lib/api/vote/vote.service';

import { queryOptions } from '@tanstack/react-query';

export const voteQueryKeys = {
  baseUserVote: ['user-vote'] as const,
  userVote: (pollId: string, walletAddress: Address) =>
    [...voteQueryKeys.baseUserVote, { pollId, walletAddress }] as const,
  baseCheckHasVoted: () => [...voteQueryKeys.baseUserVote, 'check-has-voted'] as const,
  checkHasVoted: (pollId: string, walletAddress: Address) =>
    [...voteQueryKeys.baseCheckHasVoted(), { pollId, walletAddress }] as const,
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
    // Refetch when window is focused to ensure vote is up to date
    refetchOnWindowFocus: true,
    // Cache for 1 minute since votes don't change once cast
    staleTime: 60000,
    // Retry once on failure (in case of network issues)
    retry: 1,
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
  });
