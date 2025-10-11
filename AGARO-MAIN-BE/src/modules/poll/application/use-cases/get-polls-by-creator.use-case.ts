import { Injectable, Inject } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { Poll } from '@modules/poll/domain/entities/poll.entity';

@Injectable()
export class GetPollsByCreatorUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(walletAddress: string): Promise<Poll[]> {
    return await this.pollRepository.findByCreatorWallet(walletAddress);
  }
}
