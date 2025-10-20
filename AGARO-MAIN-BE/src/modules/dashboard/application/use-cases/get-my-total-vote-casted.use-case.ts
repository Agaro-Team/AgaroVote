import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from '@/modules/dashboard/domain/repositories/dashboard-repository.interface';

/**
 * Use Case: Get My Total Vote Casted
 *
 * Retrieves the total number of votes casted by a specific wallet address
 */
@Injectable()
export class GetMyTotalVoteCastedUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(walletAddress: string): Promise<number> {
    if (!walletAddress || walletAddress.trim() === '') {
      throw new Error('Wallet address is required');
    }

    return this.dashboardRepository.getMyTotalVoteCasted(walletAddress);
  }
}
