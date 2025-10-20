export class DashboardResponseDto {
  total_vote_casted: number;
  total_active_voting_polls_today: number;
  total_rewards_earned: number;
  active_voting_polls: ActiveVotingPollDto[];
  my_total_vote_casted: number;
  my_total_pending_vote_claims: number;
}

export class ActiveVotingPollDto {
  id: string;
  name: string;
  ends_at: Date;
  percentage: number;
  total_voted: number;
}
