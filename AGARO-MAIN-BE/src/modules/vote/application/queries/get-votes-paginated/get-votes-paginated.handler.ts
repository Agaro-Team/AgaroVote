import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetVotesPaginatedQuery } from './get-votes-paginated.query';
import {
  VOTE_REPOSITORY,
  type IVoteRepository,
} from '@modules/vote/domain/repositories/vote-repository.interface';
import { Vote } from '@modules/vote/domain/entities/vote.entity';

export interface PaginatedVotesResult {
  votes: Vote[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(GetVotesPaginatedQuery)
export class GetVotesPaginatedHandler
  implements IQueryHandler<GetVotesPaginatedQuery>
{
  constructor(
    @Inject(VOTE_REPOSITORY)
    private readonly voteRepository: IVoteRepository,
  ) {}

  async execute(query: GetVotesPaginatedQuery): Promise<PaginatedVotesResult> {
    const { votes, total } = await this.voteRepository.findWithPagination(
      query.page,
      query.limit,
      query.filters,
    );

    return {
      votes,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
