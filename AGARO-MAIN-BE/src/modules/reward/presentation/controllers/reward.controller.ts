import { Wallet } from '@/modules/auth/presentation/decorators/wallet.decorator';
import { Public } from '@/modules/auth/presentation/decorators/public.decorator';
import {
  GetRewardsQueryDto,
  RewardResponseDto,
  RewardDashboardSummaryResponseDto,
  ClaimRewardDto,
} from '@modules/reward/application/dto';
import { GetRewardsUseCase } from '@modules/reward/application/use-cases/get-rewards.usecase';
import { ClaimRewardUseCase } from '@modules/reward/application/use-cases/claim-reward.usecase';
import { GetDashboardSummaryUseCase } from '@modules/reward/application/use-cases/get-dashboard-summary.usecase';
import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';

@Controller('rewards')
export class RewardController {
  constructor(
    private readonly getRewardsUseCase: GetRewardsUseCase,
    private readonly claimRewardUseCase: ClaimRewardUseCase,
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
  ) {}

  /**
   * Get all rewards with pagination and filters
   * GET /rewards
   * Authenticated endpoint - requires wallet connection
   */
  @Get()
  async getRewards(
    @Wallet() walletAddress: string,
    @Query() query: GetRewardsQueryDto,
  ): Promise<IPaginatedResult<RewardResponseDto>> {
    return await this.getRewardsUseCase.execute(walletAddress, query);
  }

  /**
   * Claim a reward by poll hash and voter wallet address
   * PUT /rewards/claim
   * Public endpoint - anyone can claim their reward
   */
  @Public()
  @Put('claim')
  async claimReward(@Body() body: ClaimRewardDto): Promise<void> {
    return await this.claimRewardUseCase.execute(body);
  }

  /**
   * Get dashboard summary for a wallet address
   * GET /rewards/dashboard/summary
   * Authenticated endpoint - requires wallet connection
   * Returns aggregated statistics about rewards across all polls
   */
  @Get('dashboard/summary')
  async getDashboardSummary(
    @Wallet() walletAddress: string,
  ): Promise<RewardDashboardSummaryResponseDto> {
    return await this.getDashboardSummaryUseCase.execute(walletAddress);
  }
}
