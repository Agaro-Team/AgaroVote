import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from '@/modules/dashboard/domain/repositories/dashboard-repository.interface';

/**
 * Use Case: Get Total Active Voting Polls Today
 *
 * Retrieves the count of currently active voting polls
 */
@Injectable()
export class GetTotalActiveVotingPollsTodayUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(): Promise<number> {
    return this.dashboardRepository.getTotalActiveVotingPollsToday();
  }
}
