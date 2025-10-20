import type { ApiResponse } from '../api.interface';

/**
 * Dashboard Summary Interfaces
 *
 * Type definitions for dashboard analytics and statistics
 */

export interface ActiveVotingPoll {
  id: string;
  name: string;
  ends_at: string;
  percentage: number;
  total_voted: number;
}

export interface DashboardSummary {
  total_vote_casted: number;
  total_active_voting_polls_today: number;
  total_rewards_earned: number;
  active_voting_polls: ActiveVotingPoll[];
  my_total_vote_casted: number;
  my_total_pending_vote_claims: number;
}

export interface GetDashboardSummaryResponse extends ApiResponse<DashboardSummary> {}
