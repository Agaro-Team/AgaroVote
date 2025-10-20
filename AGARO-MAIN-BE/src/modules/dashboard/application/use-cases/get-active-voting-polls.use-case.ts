import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
  type IDashboardVote,
} from '@/modules/dashboard/domain/repositories/dashboard-repository.interface';

/**
 * Use Case: Get Active Voting Polls
 *
 * Retrieves the list of currently active voting polls with voting statistics
 */
@Injectable()
export class GetActiveVotingPollsUseCase {
  private readonly DEFAULT_LIMIT = 3;

  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(): Promise<IDashboardVote[]> {
    return this.dashboardRepository.getActiveVotingPolls(this.DEFAULT_LIMIT);
  }
}
