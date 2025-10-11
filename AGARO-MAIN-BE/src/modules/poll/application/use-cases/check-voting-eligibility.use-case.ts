import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';

@Injectable()
export class CheckVotingEligibilityUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(
    pollId: string,
    walletAddress: string,
  ): Promise<{ eligible: boolean; reason?: string }> {
    const poll = await this.pollRepository.findWithRelations(pollId);

    if (!poll) {
      throw new NotFoundException(`Poll with id ${pollId} not found`);
    }

    if (!poll.isOngoing()) {
      return {
        eligible: false,
        reason: 'Poll is not currently ongoing',
      };
    }

    const canVote = poll.canVote(walletAddress);

    if (!canVote) {
      if (poll.isPrivate && !poll.isCreator(walletAddress)) {
        return {
          eligible: false,
          reason: 'This is a private poll',
        };
      }

      if (poll.addresses && poll.addresses.length > 0) {
        return {
          eligible: false,
          reason: 'Your wallet address is not authorized to vote in this poll',
        };
      }

      return {
        eligible: false,
        reason: 'You are not eligible to vote in this poll',
      };
    }

    return { eligible: true };
  }
}
