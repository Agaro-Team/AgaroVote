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

  async execute(pollHash: string): Promise<Poll> {
    const poll = await this.pollRepository.findByPollHash(pollHash);

    if (!poll) {
      throw new NotFoundException(`Poll with hash ${pollHash} not found`);
    }

    if (poll.isActive) {
      throw new BadRequestException('Poll is already active');
    }

    return await this.pollRepository.updateByPollHash(pollHash, {
      isActive: true,
      transactionStatus: TransactionStatus.SUCCESS,
    });
  }
}
