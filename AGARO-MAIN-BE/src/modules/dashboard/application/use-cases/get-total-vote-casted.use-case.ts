import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from '@/modules/dashboard/domain/repositories/dashboard-repository.interface';

/**
 * Use Case: Get Total Vote Casted
 *
 * Retrieves the total number of votes casted within the current month
 */
@Injectable()
export class GetTotalVoteCastedUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(): Promise<number> {
    const { startDate, endDate } = this.getCurrentMonthDateRange();
    return this.dashboardRepository.getTotalVoteCasted(startDate, endDate);
  }

  private getCurrentMonthDateRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return { startDate, endDate };
  }
}
