import { Wallet } from '@/modules/auth/presentation/decorators/wallet.decorator';
import {
  GetRewardsQueryDto,
  RewardResponseDto,
} from '@modules/reward/application/dto';
import { GetRewardsUseCase } from '@modules/reward/application/use-cases/get-rewards.usecase';
import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { ClaimRewardDto } from '../../application/dto/claim-reward.dto';
import { Public } from '@/modules/auth/presentation/decorators/public.decorator';
import { ClaimRewardUseCase } from '../../application/use-cases/claim-reward.usecase';

@Controller('rewards')
export class RewardController {
  constructor(
    private readonly getRewardsUseCase: GetRewardsUseCase,
    private readonly claimRewardUseCase: ClaimRewardUseCase,
  ) {}

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
}
