import { agaroApi } from '../agaro.api';
import type { CastVoteRequest, CastVoteResponse } from './vote.interface';

export const voteService = {
  castVote: async (vote: CastVoteRequest) => {
    const response = await agaroApi.post<CastVoteResponse>('/v1/votes', vote);
    return response;
  },
};
