import { IQuery } from '@nestjs/cqrs';

export class GetVoteStatsQuery implements IQuery {
  constructor(public readonly pollId: string) {}
}
