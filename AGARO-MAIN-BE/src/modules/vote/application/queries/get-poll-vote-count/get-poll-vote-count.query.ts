import { IQuery } from '@nestjs/cqrs';

export class GetPollVoteCountQuery implements IQuery {
  constructor(public readonly pollId: string) {}
}
