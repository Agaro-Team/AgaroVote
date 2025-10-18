import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { REWARD_REPOSITORY } from './domain/repositories/reward-repository.interface';
import { TypeORMRewardRepository } from './infrastructure/repositories/typeorm-reward.repository';
import { RewardController } from './presentation/controllers/reward.controller';
import { Reward } from './domain/entities/reward.entity';
import { CreateVoteRewardsHandler } from './application/commands/create-vote-rewards.handler';
import { GetRewardsPaginatedHandler } from './application/queries/get-rewards-paginated/get-rewards-paginated.handler';
import { GetRewardsUseCase } from './application/use-cases/get-rewards.usecase';

const CommandHandlers = [CreateVoteRewardsHandler];
const QueryHandlers = [GetRewardsPaginatedHandler];
const UseCases = [GetRewardsUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), CqrsModule],
  controllers: [RewardController],
  providers: [
    {
      provide: REWARD_REPOSITORY,
      useClass: TypeORMRewardRepository,
    },

    ...CommandHandlers,
    ...QueryHandlers,
    ...UseCases,
  ],
  exports: [REWARD_REPOSITORY],
})
export class RewardModule {}
