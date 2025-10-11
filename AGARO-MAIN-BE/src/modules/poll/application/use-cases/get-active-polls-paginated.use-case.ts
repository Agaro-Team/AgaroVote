import { Injectable, Inject } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { Poll } from '@modules/poll/domain/entities/poll.entity';
import { PollFilterDto } from '@modules/poll/application/dto/poll-filter.dto';

@Injectable()
export class GetActivePollsPaginatedUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(filters: PollFilterDto): Promise<IPaginatedResult<Poll>> {
    return await this.pollRepository.findActivePaginated(filters);
  }
}
