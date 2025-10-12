import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CheckVotingEligibilityQuery } from './check-voting-eligibility.query';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import {
  POLL_CHOICE_REPOSITORY,
  type IPollChoiceRepository,
} from '@modules/poll/domain/repositories/poll-choice-repository.interface';
import { Poll } from '@modules/poll/domain/entities/poll.entity';

export interface VotingEligibilityResult {
  eligible: boolean;
  reason?: string;
  poll?: Poll;
}

@QueryHandler(CheckVotingEligibilityQuery)
export class CheckVotingEligibilityHandler
  implements IQueryHandler<CheckVotingEligibilityQuery>
{
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    @Inject(POLL_CHOICE_REPOSITORY)
    private readonly pollChoiceRepository: IPollChoiceRepository,
  ) {}

  async execute(
    query: CheckVotingEligibilityQuery,
  ): Promise<VotingEligibilityResult> {
    // 1. Check if poll exists
    const poll = await this.pollRepository.findWithRelations(query.pollId);

    if (!poll) {
      return {
        eligible: false,
        reason: 'Poll not found',
      };
    }

    // 2. Check if poll is ongoing
    if (!poll.isOngoing()) {
      return {
        eligible: false,
        reason: poll.hasEnded()
          ? 'Poll has ended'
          : 'Poll is not currently ongoing',
        poll,
      };
    }

    // 3. Validate choice if provided
    if (query.choiceId) {
      const choice = await this.pollChoiceRepository.findById(query.choiceId);
      if (!choice || choice.pollId !== query.pollId) {
        return {
          eligible: false,
          reason: 'Invalid choice for this poll',
          poll,
        };
      }
    }

    // 4. Check if wallet can vote
    const canVote = poll.canVote(query.walletAddress);

    if (!canVote) {
      if (poll.isPrivate && !poll.isCreator(query.walletAddress)) {
        return {
          eligible: false,
          reason: 'This is a private poll',
          poll,
        };
      }

      if (poll.addresses && poll.addresses.length > 0) {
        return {
          eligible: false,
          reason: 'Your wallet address is not authorized to vote in this poll',
          poll,
        };
      }

      return {
        eligible: false,
        reason: 'You are not eligible to vote in this poll',
        poll,
      };
    }

    return {
      eligible: true,
      poll,
    };
  }
}
