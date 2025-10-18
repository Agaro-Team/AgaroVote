import type { ApiListResponse, ApiRequest, ApiResponse } from '../api.interface';

export interface Reward {
  id: string;
  vote_id: string;
  poll_id: string;
  voter_wallet_address: string;
  principal_amount: number;
  reward_amount: number;
  claimable_at: string;
  is_claimable: boolean;
  choice_id: string;
  choice_name: string;
  poll_title: string;
  poll_total_votes: number;
  choice_total_votes: number;
  created_at: string;
  updated_at: string;
}

export type GetRewardsResponse = ApiResponse<ApiListResponse<Reward>>;

export interface GetRewardsRequest extends ApiRequest {
  claimableOnly?: boolean;
}
