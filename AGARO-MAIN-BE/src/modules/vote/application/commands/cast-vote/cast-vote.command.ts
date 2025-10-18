import { ICommand } from '@nestjs/cqrs';

type CastVoteCommandProps = {
  pollId: string;
  choiceId: string;
  voterWalletAddress: string;
  transactionHash?: string;
  blockNumber?: number;
  signature?: string;
  voteWeight?: number;
  commitToken?: number;
  ipAddress?: string;
  userAgent?: string;
};
export class CastVoteCommand implements ICommand {
  constructor(public readonly props: CastVoteCommandProps) {}
}
