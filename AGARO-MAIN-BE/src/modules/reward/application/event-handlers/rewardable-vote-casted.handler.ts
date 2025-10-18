import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RewardableVoteCastedEvent } from '@modules/vote/domain/events/rewardable-vote-casted.event';
import { Inject, Logger } from '@nestjs/common';
import {
  REWARD_REPOSITORY,
  type IRewardRepository,
} from '@modules/reward/domain/repositories/reward-repository.interface';
import { Reward } from '@modules/reward/domain/entities/reward.entity';

/**
 * Event handler that creates a reward entry when a rewardable vote is cast.
 * This maintains DDD boundaries - Reward module listens to Vote module events
 * without direct module coupling.
 */
@EventsHandler(RewardableVoteCastedEvent)
export class RewardableVoteCastedHandler
  implements IEventHandler<RewardableVoteCastedEvent>
{
  private readonly logger = new Logger(RewardableVoteCastedHandler.name);

  constructor(
    @Inject(REWARD_REPOSITORY)
    private readonly rewardRepository: IRewardRepository,
  ) {}

  async handle(event: RewardableVoteCastedEvent): Promise<void> {
    try {
      // Check if reward already exists (idempotency)
      const existingReward = await this.rewardRepository.findByVoteId(
        event.voteId,
      );
      if (existingReward) {
        this.logger.warn(
          `Reward already exists for voteId: ${event.voteId}. Skipping creation.`,
        );
        return;
      }

      // Create reward entry
      const reward = new Reward();
      reward.voteId = event.voteId;
      reward.voterWalletAddress = event.voterWalletAddress;
      reward.pollId = event.pollId;
      reward.principalAmount = event.commitToken;
      reward.rewardAmount = 0; // Will be calculated when user claims
      reward.claimableAt = event.claimableAt;

      await this.rewardRepository.save(reward);

      this.logger.log(
        `Reward created for voteId: ${event.voteId}, pollId: ${event.pollId}`,
      );
    } catch (error) {
      // Log error but don't throw - vote is already saved
      // This maintains resilience - vote succeeds even if reward creation fails
      this.logger.error(
        `Failed to create reward for voteId: ${event.voteId}`,
        error instanceof Error ? error.stack : String(error),
      );

      // TODO: Could publish a RewardCreationFailedEvent for compensation logic
      // or implement retry mechanism
    }
  }
}
