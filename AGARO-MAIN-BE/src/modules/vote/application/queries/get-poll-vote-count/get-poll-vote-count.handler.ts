import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPollVoteCountQuery } from './get-poll-vote-count.query';
import {
  VOTE_STAT_REPOSITORY,
  type IVoteStatRepository,
} from '@modules/vote/domain/repositories/vote-stat-repository.interface';

@QueryHandler(GetPollVoteCountQuery)
export class GetPollVoteCountHandler
  implements IQueryHandler<GetPollVoteCountQuery>
{
  constructor(
    @Inject(VOTE_STAT_REPOSITORY)
    private readonly voteStatRepository: IVoteStatRepository,
  ) {}

  async execute(query: GetPollVoteCountQuery): Promise<number> {
    return await this.voteStatRepository.getTotalVoteCountForPoll(query.pollId);
  }
}
