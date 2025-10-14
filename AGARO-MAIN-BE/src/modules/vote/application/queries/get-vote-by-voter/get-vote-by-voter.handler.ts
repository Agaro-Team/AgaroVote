import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetVoteByVoterQuery } from './get-vote-by-voter.query';
import {
  VOTE_REPOSITORY,
  type IVoteRepository,
} from '@modules/vote/domain/repositories/vote-repository.interface';
import { Vote } from '@modules/vote/domain/entities/vote.entity';

@QueryHandler(GetVoteByVoterQuery)
export class GetVoteByVoterHandler
  implements IQueryHandler<GetVoteByVoterQuery>
{
  constructor(
    @Inject(VOTE_REPOSITORY)
    private readonly voteRepository: IVoteRepository,
  ) {}

  async execute(query: GetVoteByVoterQuery): Promise<Vote> {
    const vote = await this.voteRepository.findByPollAndVoter(
      query.pollId,
      query.voterWalletAddress,
    );

    if (!vote) {
      throw new NotFoundException(
        `Vote not found for voter ${query.voterWalletAddress} in poll ${query.pollId}`,
      );
    }

    return vote;
  }
}
