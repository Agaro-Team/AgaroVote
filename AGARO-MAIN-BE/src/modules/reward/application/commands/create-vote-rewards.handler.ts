import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateVoteRewardsCommand } from './create-vote-rewards.command';
import {
  REWARD_REPOSITORY,
  type IRewardRepository,
} from '@modules/reward/domain/repositories/reward-repository.interface';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { Reward } from '@/modules/reward/domain/entities/reward.entity';

@CommandHandler(CreateVoteRewardsCommand)
export class CreateVoteRewardsHandler
  implements ICommandHandler<CreateVoteRewardsCommand>
{
  private readonly logger = new Logger(CreateVoteRewardsHandler.name);

  constructor(
    @Inject(REWARD_REPOSITORY)
    private readonly rewardRepository: IRewardRepository,
  ) {}

  async execute(command: CreateVoteRewardsCommand): Promise<void> {
    const {
      voteId,
      voterWalletAddress,
      pollId,
      principalAmount,
      rewardAmount,
      claimableAt,
    } = command;

    // 1. Validate input amounts
    if (principalAmount < 0) {
      throw new BadRequestException('Principal amount must be non-negative');
    }

    if (rewardAmount < 0) {
      throw new BadRequestException('Reward amount must be non-negative');
    }

    // 2. Check for duplicate reward entry
    const existingReward = await this.rewardRepository.findByVoteId(voteId);
    if (existingReward) {
      this.logger.warn(
        `Reward already exists for voteId: ${voteId}. Skipping creation.`,
      );
      return; // Gracefully skip if already exists
    }

    // 3. Create and save reward
    const reward = new Reward();
    reward.voteId = voteId;
    reward.voterWalletAddress = voterWalletAddress;
    reward.pollId = pollId;
    reward.principalAmount = principalAmount;
    reward.rewardAmount = rewardAmount;
    reward.claimableAt = claimableAt;

    try {
      await this.rewardRepository.save(reward);
      this.logger.log(
        `Reward created successfully for voteId: ${voteId}, pollId: ${pollId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create reward for voteId: ${voteId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadRequestException(
        'Failed to create vote reward. Please try again.',
      );
    }
  }
}
