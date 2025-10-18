import { Reward } from '../../domain/entities/reward.entity';

export class GetRewardResponseDto {
  id: string;
  voteId: string;
  pollId: string;
  voterWalletAddress: string;
  principalAmount: number;
  rewardAmount: number;
  claimableAt: string;
  isClaimable: boolean;
  choiceId: string;
  choiceName: string;
  pollTitle: string;
  pollEndsAt: string;

  static fromEntity(reward: Reward): GetRewardResponseDto {
    const dto = new GetRewardResponseDto();
    dto.id = reward.id;
    dto.voteId = reward.voteId;
    dto.pollId = reward.pollId;
    dto.voterWalletAddress = reward.voterWalletAddress;
    dto.principalAmount = reward.principalAmount;
    dto.rewardAmount = reward.rewardAmount;
    dto.claimableAt = reward.claimableAt.toISOString();
    dto.isClaimable = reward.isClaimable();
    dto.choiceId = reward.vote?.choiceId || '';
    dto.choiceName = reward.vote?.choice?.choiceText || 'Unknown';
    dto.pollTitle = reward.poll?.title || 'Unknown Poll';
    dto.pollEndsAt = reward.poll?.endDate.toISOString() || '';

    return dto;
  }
}
