import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IPollRepository,
  POLL_REPOSITORY,
} from '../../domain/repositories/poll-repository.interface';
import { Poll } from '../../domain/entities/poll.entity';

@Injectable()
export class UpdateVoterHashUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(pollHash: string, voterHash: string): Promise<Poll> {
    const poll = await this.pollRepository.findByPollHash(pollHash);
    if (!poll) {
      throw new NotFoundException(`Poll with pool hash ${pollHash} not found`);
    }
    return await this.pollRepository.updateByPollHash(pollHash, { voterHash });
  }
}
