import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  type IRewardRepository,
  REWARD_REPOSITORY,
} from '../../domain/repositories/reward-repository.interface';
import { GetRewardsQueryDto } from '../dto/get-rewards-query.dto';
import { RewardResponseDto } from '../dto/reward-response.dto';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { GetRewardsPaginatedQuery, PaginatedRewardsResult } from '../queries';

@Injectable()
export class GetRewardsUseCase {
  constructor(
    @Inject(REWARD_REPOSITORY)
    private readonly rewardRepository: IRewardRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    walletAddress: string,
    query: GetRewardsQueryDto,
  ): Promise<IPaginatedResult<RewardResponseDto>> {
    const filters: {
      pollId?: string;
      claimableOnly?: boolean;
      voterWalletAddress?: string;
    } = {};

    filters.claimableOnly = Boolean(query.claimableOnly);

    if (query.pollId) filters.pollId = query.pollId;
    if (walletAddress) filters.voterWalletAddress = walletAddress;

    const result = await this.queryBus.execute<
      GetRewardsPaginatedQuery,
      PaginatedRewardsResult
    >(
      new GetRewardsPaginatedQuery(query.page || 1, query.limit || 10, filters),
    );

    // Map rewards with stats (already populated by repository subqueries)
    const rewardsWithStats: RewardResponseDto[] = result.rewards.map((reward) =>
      RewardResponseDto.fromEntityWithStats(
        reward,
        reward.pollTotalVotes ?? 0,
        reward.choiceTotalVotes ?? 0,
      ),
    );

    const paginatedResult: IPaginatedResult<RewardResponseDto> = {
      data: rewardsWithStats,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };

    return paginatedResult;
  }
}
