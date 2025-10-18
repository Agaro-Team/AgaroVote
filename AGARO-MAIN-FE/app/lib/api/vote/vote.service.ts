import { agaroApi } from '../agaro.api.client';
import type {
  CastVoteRequest,
  CastVoteResponse,
  CheckHasVotedRequest,
  CheckHasVotedResponse,
  GetUserVoteRequest,
  GetUserVoteResponse,
} from './vote.interface';

export const voteService = {
  castVote: async (vote: CastVoteRequest) => {
    const response = await agaroApi.post<CastVoteResponse>('/v1/votes', vote);
    return response;
  },

  getUserVote: async ({ pollId, voterWalletAddress }: GetUserVoteRequest) => {
    try {
      const response = await agaroApi.get<GetUserVoteResponse>(
        `/v1/votes/poll/${pollId}/voter/${voterWalletAddress}`
      );
      return response;
    } catch (error: any) {
      // If 404, user hasn't voted yet - return null
      if (error?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  checkHasVoted: async ({ pollId, voterWalletAddress }: CheckHasVotedRequest) => {
    const response = await agaroApi.get<CheckHasVotedResponse>(
      `/v1/votes/poll/${pollId}/voter/${voterWalletAddress}/has-voted`
    );
    return response;
  },
};
