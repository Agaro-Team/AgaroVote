import { Reward } from '@modules/reward/domain/entities/reward.entity';

export class RewardResponseDto {
  public readonly id: string;
  public readonly vote_id: string;
  public readonly poll_id: string;
  public readonly voter_wallet_address: string;
  public readonly principal_amount: number;
  public readonly reward_amount: number;
  public readonly claimable_at: string;
  public readonly is_claimable: boolean;
  public readonly choice_id: string;
  public readonly choice_name: string;
  public readonly poll_title: string;
  public readonly poll_total_votes: number;
  public readonly choice_total_votes: number;
  public readonly synthetic_reward_contract_address: string;
  public readonly created_at: string;
  public readonly updated_at: string;

  constructor(
    id: string,
    voteId: string,
    pollId: string,
    voterWalletAddress: string,
    principalAmount: number,
    rewardAmount: number,
    claimableAt: string,
    isClaimable: boolean,
    choiceId: string,
    choiceName: string,
    pollTitle: string,
    pollTotalVotes: number,
    choiceTotalVotes: number,
    syntheticRewardContractAddress: string,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.vote_id = voteId;
    this.poll_id = pollId;
    this.voter_wallet_address = voterWalletAddress;
    this.principal_amount = principalAmount;
    this.reward_amount = rewardAmount;
    this.claimable_at = claimableAt;
    this.is_claimable = isClaimable;
    this.choice_id = choiceId;
    this.choice_name = choiceName;
    this.poll_title = pollTitle;
    this.poll_total_votes = pollTotalVotes;
    this.choice_total_votes = choiceTotalVotes;
    this.synthetic_reward_contract_address = syntheticRewardContractAddress;
    this.created_at = createdAt;
    this.updated_at = updatedAt;
  }

  static fromEntityWithStats(
    reward: Reward & { syntheticRewardContractAddress?: string },
    pollTotalVotes: number,
    choiceTotalVotes: number,
  ): RewardResponseDto {
    return new RewardResponseDto(
      reward.id,
      reward.voteId,
      reward.pollId,
      reward.voterWalletAddress,
      Number(reward.principalAmount),
      Number(reward.rewardAmount),
      reward.claimableAt.toISOString(),
      reward.isClaimable(),
      reward.vote?.choiceId || '',
      reward.vote?.choice?.choiceText || 'Unknown',
      reward.poll?.title || 'Unknown Poll',
      pollTotalVotes,
      choiceTotalVotes,
      reward.syntheticRewardContractAddress || '',
      reward.createdAt.toISOString(),
      reward.updatedAt.toISOString(),
    );
  }

  static fromEntities(rewards: Reward[]): RewardResponseDto[] {
    // This is a simplified version, use fromEntityWithStats for full implementation
    return rewards.map((reward) => this.fromEntityWithStats(reward, 0, 0));
  }
}
