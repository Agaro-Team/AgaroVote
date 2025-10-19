import { Inject, Injectable } from '@nestjs/common';
import { RewardDashboardSummaryResponseDto } from '../dto/reward-dashboard-summary.dto';
import type { IRewardRepository } from '../../domain/repositories/reward-repository.interface';
import { REWARD_REPOSITORY } from '../../domain/repositories/reward-repository.interface';

/**
 * Use Case: Get Dashboard Summary
 *
 * Retrieves aggregated reward statistics for a user's dashboard
 * Includes total claimed, pending, and claimable rewards across all polls
 *
 * @example
 * ```typescript
 * const summary = await getDashboardSummaryUseCase.execute('0x123...');
 * console.log(summary.totalClaimableAmount); // Total available to claim
 * console.log(summary.claimableDashboardDtos); // List of claimable polls
 * ```
 */
@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    @Inject(REWARD_REPOSITORY)
    private readonly rewardRepository: IRewardRepository,
  ) {}

  /**
   * Execute the use case
   *
   * @param walletAddress User's wallet address
   * @returns Promise<RewardDashboardSummaryResponseDto> Aggregated dashboard summary
   */
  async execute(
    walletAddress: string,
  ): Promise<RewardDashboardSummaryResponseDto> {
    // Validate wallet address
    if (!walletAddress || walletAddress.trim() === '') {
      throw new Error('Wallet address is required');
    }

    // Get all rewards for the wallet address with poll relations loaded
    const rewards =
      await this.rewardRepository.findByVoterWalletAddress(walletAddress);

    // If no rewards found, return empty summary
    if (!rewards || rewards.length === 0) {
      return RewardDashboardSummaryResponseDto.empty();
    }

    // Aggregate and return the summary
    return RewardDashboardSummaryResponseDto.fromEntities(rewards);
  }
}
