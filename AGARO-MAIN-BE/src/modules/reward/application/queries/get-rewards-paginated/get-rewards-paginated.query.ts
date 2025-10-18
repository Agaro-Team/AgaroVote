import { IQuery } from '@nestjs/cqrs';

export class GetRewardsPaginatedQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly filters?: {
      pollId?: string;
      voterWalletAddress?: string;
      claimableOnly?: boolean;
    },
  ) {}
}
