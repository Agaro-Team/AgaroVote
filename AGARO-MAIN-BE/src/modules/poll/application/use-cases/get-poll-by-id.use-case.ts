import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { Poll } from '@modules/poll/domain/entities/poll.entity';

@Injectable()
export class GetPollByIdUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(id: string): Promise<Poll> {
    const poll = await this.pollRepository.findWithRelations(id);

    if (!poll) {
      throw new NotFoundException(`Poll with id ${id} not found`);
    }

    return poll;
  }
}
