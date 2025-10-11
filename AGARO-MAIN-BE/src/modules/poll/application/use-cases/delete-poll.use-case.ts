import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';

@Injectable()
export class DeletePollUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    const poll = await this.pollRepository.findById(id);

    if (!poll) {
      throw new NotFoundException(`Poll with id ${id} not found`);
    }

    return await this.pollRepository.delete(id);
  }
}
