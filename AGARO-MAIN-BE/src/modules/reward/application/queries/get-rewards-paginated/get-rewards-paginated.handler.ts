import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRewardsPaginatedQuery } from './get-rewards-paginated.query';
import {
  REWARD_REPOSITORY,
  type IRewardRepository,
} from '@modules/reward/domain/repositories/reward-repository.interface';
import type { Reward } from '@modules/reward/domain/entities/reward.entity';

export interface PaginatedRewardsResult {
  rewards: Reward[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(GetRewardsPaginatedQuery)
export class GetRewardsPaginatedHandler
  implements IQueryHandler<GetRewardsPaginatedQuery>
{
  constructor(
    @Inject(REWARD_REPOSITORY)
    private readonly rewardRepository: IRewardRepository,
  ) {}

  async execute(
    query: GetRewardsPaginatedQuery,
  ): Promise<PaginatedRewardsResult> {
    const { rewards, total } = await this.rewardRepository.findWithPagination(
      query.page,
      query.limit,
      query.filters,
    );

    return {
      rewards,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
