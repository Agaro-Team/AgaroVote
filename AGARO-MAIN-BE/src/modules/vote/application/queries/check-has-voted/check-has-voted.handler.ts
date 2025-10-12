import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CheckHasVotedQuery } from './check-has-voted.query';
import {
  VOTE_REPOSITORY,
  type IVoteRepository,
} from '@modules/vote/domain/repositories/vote-repository.interface';

@QueryHandler(CheckHasVotedQuery)
export class CheckHasVotedHandler implements IQueryHandler<CheckHasVotedQuery> {
  constructor(
    @Inject(VOTE_REPOSITORY)
    private readonly voteRepository: IVoteRepository,
  ) {}

  async execute(query: CheckHasVotedQuery): Promise<boolean> {
    return await this.voteRepository.hasVoted(
      query.pollId,
      query.voterWalletAddress,
    );
  }
}
