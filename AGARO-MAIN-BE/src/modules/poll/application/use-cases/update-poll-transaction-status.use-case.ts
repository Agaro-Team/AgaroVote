import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import {
  Poll,
  TransactionStatus,
} from '@modules/poll/domain/entities/poll.entity';

@Injectable()
export class UpdatePollTransactionStatusUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(
    id: string,
    transactionStatus: TransactionStatus,
  ): Promise<Poll> {
    const poll = await this.pollRepository.findById(id);

    if (!poll) {
      throw new NotFoundException(`Poll with id ${id} not found`);
    }

    return await this.pollRepository.update(id, { transactionStatus });
  }
}
