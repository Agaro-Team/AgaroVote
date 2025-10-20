export interface IDashboardVote {
  id: string;
  name: string;
  ends_at: Date;
  percentage: number;
  total_voted: number;
}

export interface IDashboardRepository {
  // Global analytics
  getTotalVoteCasted(startDate: Date, endDate: Date): Promise<number>;
  getTotalActiveVotingPollsToday(): Promise<number>;
  getTotalRewardsEarned(startDate: Date, endDate: Date): Promise<number>;
  getActiveVotingPolls(limit: number): Promise<IDashboardVote[]>;

  // User analytics
  getMyTotalVoteCasted(walletAddress: string): Promise<number>;
  getMyTotalPendingVoteClaims(walletAddress: string): Promise<number>;
}

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');
