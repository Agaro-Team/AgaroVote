import { agaroApi } from '../agaro.api';
import type { CreatePollRequest, GetPollsRequest, GetPollsResponse } from './poll.interface';

export const pollService = {
  createPoll: async (poll: CreatePollRequest) => {
    await agaroApi.post('/v1/polls', poll);
  },
  getActivePolls: async (params: GetPollsRequest) => {
    params.isActive = params.isActive ?? true;
    const response = await agaroApi.get<GetPollsResponse | undefined>('/v1/polls', { params });
    return response;
  },
};
