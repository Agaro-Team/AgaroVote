import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import {
  Poll,
  TransactionStatus,
} from '@modules/poll/domain/entities/poll.entity';

@Injectable()
export class ActivatePollUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(poolHash: string): Promise<Poll> {
    const poll = await this.pollRepository.findByPoolHash(poolHash);

    if (!poll) {
      throw new NotFoundException(`Poll with hash ${poolHash} not found`);
    }

    if (poll.isActive) {
      throw new BadRequestException('Poll is already active');
    }

    // Activate the poll and set transaction status to success
    return await this.pollRepository.updateByPoolHash(poolHash, {
      isActive: true,
      transactionStatus: TransactionStatus.SUCCESS,
    });
  }
}
