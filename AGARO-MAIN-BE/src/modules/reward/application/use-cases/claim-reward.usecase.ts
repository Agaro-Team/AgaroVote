import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  type IRewardRepository,
  REWARD_REPOSITORY,
} from '../../domain/repositories/reward-repository.interface';
import { ClaimRewardDto } from '../dto/claim-reward.dto';

@Injectable()
export class ClaimRewardUseCase {
  constructor(
    @Inject(REWARD_REPOSITORY)
    private readonly rewardRepository: IRewardRepository,
  ) {}

  async execute(body: ClaimRewardDto): Promise<void> {
    // Find the reward by poll hash and voter wallet address
    const reward = await this.rewardRepository.findByPollHashAndVoterWallet(
      body.pollHash,
      body.voterWalletAddress,
    );

    if (!reward) {
      throw new NotFoundException(
        `Reward not found for poll hash ${body.pollHash} and wallet ${body.voterWalletAddress}`,
      );
    }

    // Check if already claimed
    if (reward.isClaimed()) {
      throw new BadRequestException('Reward has already been claimed');
    }

    // Check if claimable
    if (!reward.isClaimable()) {
      throw new BadRequestException('Reward is not yet claimable');
    }

    // Update the reward as claimed
    await this.rewardRepository.updateByPollHashAndVoterWallet(
      body.pollHash,
      body.voterWalletAddress,
      {
        claimedAt: new Date(),
        principalAmount: body.principalAmount,
        rewardAmount: body.rewardAmount,
      },
    );
  }
}
