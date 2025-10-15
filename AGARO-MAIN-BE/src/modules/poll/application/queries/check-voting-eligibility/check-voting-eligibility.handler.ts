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
        reason: 'Poll not found.',
      };
    }

    // 2. Check if poll has ended
    if (poll.hasEnded()) {
      return {
        eligible: false,
        reason: 'Voting has closed for this poll.',
        poll,
      };
    }

    // 3. Check if poll has started
    if (!poll.hasStarted()) {
      const startDate = new Date(poll.startDate);
      const formattedDate = startDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return {
        eligible: false,
        reason: `Voting will start on ${formattedDate}.`,
        poll,
      };
    }

    // 4. Check if poll transaction is successful
    if (!poll.isTransactionSuccessful()) {
      return {
        eligible: false,
        reason: 'This poll is not yet active on the blockchain.',
        poll,
      };
    }

    // 5. Check if poll is active
    if (!poll.isActive) {
      return {
        eligible: false,
        reason: 'This poll is currently inactive.',
        poll,
      };
    }

    // 6. Validate choice if provided
    if (query.choiceId) {
      const choice = await this.pollChoiceRepository.findById(query.choiceId);
      if (!choice || choice.pollId !== query.pollId) {
        return {
          eligible: false,
          reason: 'Invalid choice for this poll.',
          poll,
        };
      }
    }

    // 7. Check if wallet address is in the allowed list (if restricted)
    if (poll.addresses && poll.addresses.length > 0) {
      const isAddressAllowed = poll.addresses.some(
        (addr) => addr.walletAddress === query.walletAddress,
      );

      if (!isAddressAllowed) {
        return {
          eligible: false,
          reason:
            'You are not allowed to vote for this poll. Only invited addresses can vote.',
          poll,
        };
      }
    }

    // 8. Check if poll is private and user is not creator (additional check)
    if (poll.isPrivate && !poll.isCreator(query.walletAddress)) {
      // If private and has no specific addresses, only creator can vote
      if (!poll.addresses || poll.addresses.length === 0) {
        return {
          eligible: false,
          reason: 'This is a private poll and you are not authorized to vote.',
          poll,
        };
      }
    }

    return {
      eligible: true,
      poll,
    };
  }
}
