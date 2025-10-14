import { IQuery } from '@nestjs/cqrs';

export class CheckHasVotedQuery implements IQuery {
  constructor(
    public readonly pollId: string,
    public readonly voterWalletAddress: string,
  ) {}
}
