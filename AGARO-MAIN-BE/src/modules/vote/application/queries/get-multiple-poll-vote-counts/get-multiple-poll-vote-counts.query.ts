import { IQuery } from '@nestjs/cqrs';

export class GetMultiplePollVoteCountsQuery implements IQuery {
  constructor(public readonly pollIds: string[]) {}
}
