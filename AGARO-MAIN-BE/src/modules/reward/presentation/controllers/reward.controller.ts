import { Wallet } from '@/modules/auth/presentation/decorators/wallet.decorator';
import {
  GetRewardsQueryDto,
  RewardResponseDto,
} from '@modules/reward/application/dto';
import { GetRewardsUseCase } from '@modules/reward/application/use-cases/get-rewards.usecase';
import { Controller, Get, Query } from '@nestjs/common';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';

@Controller('rewards')
export class RewardController {
  constructor(private readonly getRewardsUseCase: GetRewardsUseCase) {}

  /**
   * Get all rewards with pagination and filters
   * GET /rewards
   * Public endpoint - anyone can view rewards
   */
  @Get()
  async getRewards(
    @Wallet() walletAddress: string,
    @Query() query: GetRewardsQueryDto,
  ): Promise<IPaginatedResult<RewardResponseDto>> {
    console.log({
      walletAddress: walletAddress,
    });
    return await this.getRewardsUseCase.execute(walletAddress, query);
  }
}
