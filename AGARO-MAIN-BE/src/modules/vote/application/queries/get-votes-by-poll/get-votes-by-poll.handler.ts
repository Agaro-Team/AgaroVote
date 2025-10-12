import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetVotesByPollQuery } from './get-votes-by-poll.query';
import {
  VOTE_REPOSITORY,
  type IVoteRepository,
} from '@modules/vote/domain/repositories/vote-repository.interface';
import { Vote } from '@modules/vote/domain/entities/vote.entity';

@QueryHandler(GetVotesByPollQuery)
export class GetVotesByPollHandler
  implements IQueryHandler<GetVotesByPollQuery>
{
  constructor(
    @Inject(VOTE_REPOSITORY)
    private readonly voteRepository: IVoteRepository,
  ) {}

  async execute(query: GetVotesByPollQuery): Promise<Vote[]> {
    return await this.voteRepository.findByPollId(query.pollId);
  }
}
