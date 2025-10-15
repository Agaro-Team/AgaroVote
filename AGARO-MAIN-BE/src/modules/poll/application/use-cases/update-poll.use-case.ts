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
import { UpdatePollDto } from '@modules/poll/application/dto/update-poll.dto';
import { Poll } from '@modules/poll/domain/entities/poll.entity';

@Injectable()
export class UpdatePollUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
  ) {}

  async execute(id: string, updatePollDto: UpdatePollDto): Promise<Poll> {
    const existingPoll = await this.pollRepository.findById(id);

    if (!existingPoll) {
      throw new NotFoundException(`Poll with id ${id} not found`);
    }

    // Build update object with proper types
    const updates: {
      title?: string;
      description?: string;
      isPrivate?: boolean;
      transactionStatus?: Poll['transactionStatus'];
      isActive?: boolean;
      isTokenRequired?: boolean;
      rewardShare?: number;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (updatePollDto.title !== undefined) {
      updates.title = updatePollDto.title;
    }
    if (updatePollDto.description !== undefined) {
      updates.description = updatePollDto.description;
    }
    if (updatePollDto.isPrivate !== undefined) {
      updates.isPrivate = updatePollDto.isPrivate;
    }
    if (updatePollDto.transactionStatus !== undefined) {
      updates.transactionStatus = updatePollDto.transactionStatus;
    }
    if (updatePollDto.isActive !== undefined) {
      updates.isActive = updatePollDto.isActive;
    }
    if (updatePollDto.isTokenRequired !== undefined) {
      updates.isTokenRequired = updatePollDto.isTokenRequired;
    }
    if (updatePollDto.rewardShare !== undefined) {
      updates.rewardShare = updatePollDto.rewardShare;
    }
    if (updatePollDto.startDate) {
      updates.startDate = new Date(updatePollDto.startDate);
    }
    if (updatePollDto.endDate) {
      updates.endDate = new Date(updatePollDto.endDate);
    }

    // Validate dates
    const finalStartDate = updates.startDate ?? existingPoll.startDate;
    const finalEndDate = updates.endDate ?? existingPoll.endDate;

    if (finalStartDate >= finalEndDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    return await this.pollRepository.update(id, updates);
  }
}
