import { IQuery } from '@nestjs/cqrs';

export class GetVotesByPollQuery implements IQuery {
  constructor(public readonly pollId: string) {}
}
