import { agaroApi } from '../agaro.api.client';
import type {
  GetDashboardRewardSummaryResponse,
  GetRewardsRequest,
  GetRewardsResponse,
} from './reward.interface';

export const rewardService = {
  getRewards: async (request: GetRewardsRequest) => {
    const response = await agaroApi.get<GetRewardsResponse>('/v1/rewards', {
      params: request,
    });
    return response;
  },
  getDashboardRewardSummary: async () => {
    const response = await agaroApi.get<GetDashboardRewardSummaryResponse | undefined>(
      '/v1/rewards/dashboard/summary'
    );
    return response;
  },
};
