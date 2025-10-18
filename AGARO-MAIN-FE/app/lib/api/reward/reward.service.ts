import { agaroApi } from '../agaro.api.client';
import type { GetRewardsRequest, GetRewardsResponse } from './reward.interface';

export const rewardService = {
  getRewards: async (request: GetRewardsRequest) => {
    const response = await agaroApi.get<GetRewardsResponse>('/v1/rewards', {
      params: request,
    });
    return response;
  },
};
