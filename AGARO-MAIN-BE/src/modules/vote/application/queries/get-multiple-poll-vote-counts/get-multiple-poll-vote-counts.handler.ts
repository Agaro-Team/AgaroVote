import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMultiplePollVoteCountsQuery } from './get-multiple-poll-vote-counts.query';
import {
  VOTE_STAT_REPOSITORY,
  type IVoteStatRepository,
} from '@modules/vote/domain/repositories/vote-stat-repository.interface';

export interface PollVoteCountMap {
  [pollId: string]: number;
}

@QueryHandler(GetMultiplePollVoteCountsQuery)
export class GetMultiplePollVoteCountsHandler
  implements IQueryHandler<GetMultiplePollVoteCountsQuery>
{
  constructor(
    @Inject(VOTE_STAT_REPOSITORY)
    private readonly voteStatRepository: IVoteStatRepository,
  ) {}

  async execute(
    query: GetMultiplePollVoteCountsQuery,
  ): Promise<PollVoteCountMap> {
    if (query.pollIds.length === 0) {
      return {};
    }

    // Single query with WHERE IN clause - efficient!
    const stats = await this.voteStatRepository.findByPollIds(query.pollIds);

    // Group by pollId and sum vote counts
    const voteCountMap: PollVoteCountMap = {};

    // Initialize all polls with 0
    query.pollIds.forEach((pollId) => {
      voteCountMap[pollId] = 0;
    });

    // Sum up votes per poll
    stats.forEach((stat) => {
      if (!voteCountMap[stat.pollId]) {
        voteCountMap[stat.pollId] = 0;
      }
      voteCountMap[stat.pollId] += stat.voteCount;
    });

    return voteCountMap;
  }
}
