import { ICommand } from '@nestjs/cqrs';

export class CreateVoteRewardsCommand implements ICommand {
  constructor(
    public readonly voteId: string,
    public readonly voterWalletAddress: string,
    public readonly pollId: string,
    public readonly principalAmount: number,
    public readonly rewardAmount: number,
    public readonly claimableAt: Date,
  ) {}
}
