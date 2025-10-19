import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { REWARD_REPOSITORY } from './domain/repositories/reward-repository.interface';
import { TypeORMRewardRepository } from './infrastructure/repositories/typeorm-reward.repository';
import { RewardController } from './presentation/controllers/reward.controller';
import { Reward } from './domain/entities/reward.entity';
import { GetRewardsPaginatedHandler } from './application/queries/get-rewards-paginated/get-rewards-paginated.handler';
import { GetRewardsUseCase } from './application/use-cases/get-rewards.usecase';
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.usecase';
import { RewardableVoteCastedHandler } from './application/event-handlers/rewardable-vote-casted.handler';
import { ClaimRewardUseCase } from './application/use-cases/claim-reward.usecase';

const QueryHandlers = [GetRewardsPaginatedHandler];
const EventHandlers = [RewardableVoteCastedHandler];
const UseCases = [
  GetRewardsUseCase,
  ClaimRewardUseCase,
  GetDashboardSummaryUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), CqrsModule],
  controllers: [RewardController],
  providers: [
    {
      provide: REWARD_REPOSITORY,
      useClass: TypeORMRewardRepository,
    },

    ...QueryHandlers,
    ...EventHandlers,
    ...UseCases,
  ],
  exports: [REWARD_REPOSITORY],
})
export class RewardModule {}
