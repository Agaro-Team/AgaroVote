import { agaroApi } from '../agaro.api.client';
import type {
  CheckVotingEligibilityRequest,
  CheckVotingEligibilityResponse,
  CreatePollRequest,
  CreatePollResponse,
  GetPollResponse,
  GetPollsRequest,
  GetPollsResponse,
} from './poll.interface';

export const pollService = {
  createPoll: async (poll: CreatePollRequest) => {
    const response = await agaroApi.post<CreatePollResponse>('/v1/polls', poll);
    return response;
  },
  getActivePolls: async (params: GetPollsRequest) => {
    params.isActive = params.isActive ?? true;
    const response = await agaroApi.get<GetPollsResponse | undefined>('/v1/polls', { params });
    return response;
  },
  getPollDetail: async (pollHash: string) => {
    const response = await agaroApi.get<GetPollResponse>(`/v1/polls/${pollHash}`);
    return response.data;
  },
  checkVotingEligibility: async ({ pollId, walletAddress }: CheckVotingEligibilityRequest) => {
    const response = await agaroApi.get<CheckVotingEligibilityResponse>(
      `/v1/polls/${pollId}/eligibility`,
      {
        params: { walletAddress },
      }
    );
    return response;
  },
};
