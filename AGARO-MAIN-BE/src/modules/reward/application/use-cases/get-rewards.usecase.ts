import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { GetRewardsQueryDto } from '../dto/get-rewards-query.dto';
import { RewardResponseDto } from '../dto/reward-response.dto';
import {
  GetRewardsPaginatedFilters,
  GetRewardsPaginatedQuery,
  PaginatedRewardsResult,
} from '../queries';

@Injectable()
export class GetRewardsUseCase {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(
    walletAddress: string,
    query: GetRewardsQueryDto,
  ): Promise<IPaginatedResult<RewardResponseDto>> {
    const filters: GetRewardsPaginatedFilters = {};

    filters.claimableOnly = Boolean(query.claimableOnly);
    filters.claimedOnly = Boolean(query.claimedOnly);
    filters.pendingOnly = Boolean(query.pendingOnly);
    filters.claimableOnly = filters.claimableOnly && !filters.claimedOnly;
    filters.claimedOnly = filters.claimedOnly && !filters.claimableOnly;
    filters.pendingOnly =
      filters.pendingOnly && !filters.claimableOnly && !filters.claimedOnly;

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
