import { agaroApi } from '../agaro.api';
import type {
  CreatePollRequest,
  GetPollResponse,
  GetPollsRequest,
  GetPollsResponse,
} from './poll.interface';

export const pollService = {
  createPoll: async (poll: CreatePollRequest) => {
    await agaroApi.post('/v1/polls', poll);
  },
  getActivePolls: async (params: GetPollsRequest) => {
    params.isActive = params.isActive ?? true;
    const response = await agaroApi.get<GetPollsResponse | undefined>('/v1/polls', { params });
    return response;
  },
  getPollDetail: async (poolHash: string) => {
    const response = await agaroApi.get<GetPollResponse>(`/v1/polls/${poolHash}`);
    return response.data;
  },
};
