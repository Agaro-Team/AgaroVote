import { IQuery } from '@nestjs/cqrs';

export interface GetRewardsPaginatedFilters {
  pollId?: string;
  voterWalletAddress?: string;
  claimableOnly?: boolean;
  claimedOnly?: boolean;
}

export class GetRewardsPaginatedQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly filters?: GetRewardsPaginatedFilters,
  ) {}
}
