import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  POLL_ADDRESS_REPOSITORY,
  type IPollAddressRepository,
} from '@modules/poll/domain/repositories/poll-address-repository.interface';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { PollAddress } from '@modules/poll/domain/entities/poll-address.entity';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { InvitedAddressFilterDto } from '../dto/invited-address-filter.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class GetInvitedAddressesByPollPaginatedUseCase {
  constructor(
    @Inject(POLL_ADDRESS_REPOSITORY)
    private readonly pollAddressRepository: IPollAddressRepository,
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(
    pollId: string,
    filters: InvitedAddressFilterDto,
  ): Promise<IPaginatedResult<PollAddress>> {
    if (!isUUID(pollId)) {
      throw new BadRequestException('Poll id must be a valid UUID');
    }

    // Verify poll exists
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new NotFoundException(`Poll with id ${pollId} not found`);
    }

    // Get paginated invited addresses for the poll
    return await this.pollAddressRepository.findByPollIdPaginated(
      pollId,
      filters,
    );
  }
}
