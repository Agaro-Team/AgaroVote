import { Module } from '@nestjs/common';
import { DASHBOARD_REPOSITORY } from './domain/repositories/dashboard-repository.interface';
import { TypeORMDashboardRepository } from './infrastructure/repositories/typeorm-dashboard.repository';
import { DashboardController } from './presentation/controllers/dashboard.controller';
import { GetTotalVoteCastedUseCase } from './application/use-cases/get-total-vote-casted.use-case';
import { GetTotalActiveVotingPollsTodayUseCase } from './application/use-cases/get-total-active-voting-polls-today.use-case';
import { GetTotalRewardsEarnedUseCase } from './application/use-cases/get-total-rewards-earned.use-case';
import { GetActiveVotingPollsUseCase } from './application/use-cases/get-active-voting-polls.use-case';
import { GetMyTotalVoteCastedUseCase } from './application/use-cases/get-my-total-vote-casted.use-case';
import { GetMyTotalPendingVoteClaimsUseCase } from './application/use-cases/get-my-total-pending-vote-claims.use-case';

@Module({
  imports: [],
  controllers: [DashboardController],
  providers: [
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: TypeORMDashboardRepository,
    },
    GetTotalVoteCastedUseCase,
    GetTotalActiveVotingPollsTodayUseCase,
    GetTotalRewardsEarnedUseCase,
    GetActiveVotingPollsUseCase,
    GetMyTotalVoteCastedUseCase,
    GetMyTotalPendingVoteClaimsUseCase,
  ],
  exports: [DASHBOARD_REPOSITORY],
})
export class DashboardModule {}
