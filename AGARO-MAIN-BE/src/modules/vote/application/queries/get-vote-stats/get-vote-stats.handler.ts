import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetVoteStatsQuery } from './get-vote-stats.query';
import {
  VOTE_STAT_REPOSITORY,
  type IVoteStatRepository,
} from '@modules/vote/domain/repositories/vote-stat-repository.interface';
import { VoteStat } from '@modules/vote/domain/entities/vote-stat.entity';

@QueryHandler(GetVoteStatsQuery)
export class GetVoteStatsHandler implements IQueryHandler<GetVoteStatsQuery> {
  constructor(
    @Inject(VOTE_STAT_REPOSITORY)
    private readonly voteStatRepository: IVoteStatRepository,
  ) {}

  async execute(query: GetVoteStatsQuery): Promise<VoteStat[]> {
    const stats = await this.voteStatRepository.findByPollId(query.pollId);
    return stats || [];
  }
}
