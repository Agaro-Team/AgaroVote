import { IEvent } from '@nestjs/cqrs';

/**
 * Event published when a vote is cast on a poll that supports rewards.
 * This event is consumed by the Reward module to create reward entries.
 */
export class RewardableVoteCastedEvent implements IEvent {
  constructor(
    public readonly voteId: string,
    public readonly voterWalletAddress: string,
    public readonly pollId: string,
    public readonly commitToken: number,
    public readonly claimableAt: Date,
  ) {}
}
