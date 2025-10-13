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

    // Check transaction status first
    if (poll.isPending()) {
      return {
        eligible: false,
        reason: 'Poll is pending blockchain confirmation',
      };
    }

    if (poll.isTransactionFailed()) {
      return {
        eligible: false,
        reason: 'Poll transaction failed',
      };
    }

    // Check if poll is active
    if (!poll.isActive) {
      return {
        eligible: false,
        reason: 'Poll is not active',
      };
    }

    // Check date range
    if (!poll.hasStarted()) {
      return {
        eligible: false,
        reason: 'Poll has not started yet',
      };
    }

    if (poll.hasEnded()) {
      return {
        eligible: false,
        reason: 'Poll has ended',
      };
    }

    // Check access control
    if (poll.isPrivate && !poll.isCreator(walletAddress)) {
      return {
        eligible: false,
        reason: 'This is a private poll and you are not the creator',
      };
    }

    // Check whitelist if exists
    if (poll.addresses && poll.addresses.length > 0) {
      const isWhitelisted = poll.addresses.some(
        (addr) => addr.walletAddress === walletAddress,
      );

      if (!isWhitelisted) {
        return {
          eligible: false,
          reason: 'Your wallet address is not authorized to vote in this poll',
        };
      }
    }

    return { eligible: true, reason: 'OK' };
  }
}
