import { ICommand } from '@nestjs/cqrs';

export class CastVoteCommand implements ICommand {
  constructor(
    public readonly pollId: string,
    public readonly choiceId: string,
    public readonly voterWalletAddress: string,
    public readonly transactionHash?: string,
    public readonly blockNumber?: number,
    public readonly signature?: string,
    public readonly voteWeight?: number,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
