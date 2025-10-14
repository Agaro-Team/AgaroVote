import { IQuery } from '@nestjs/cqrs';

export class CheckVotingEligibilityQuery implements IQuery {
  constructor(
    public readonly pollId: string,
    public readonly walletAddress: string,
    public readonly choiceId?: string, // Optional, for choice validation
  ) {}
}
