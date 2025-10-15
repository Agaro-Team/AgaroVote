import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import {
  POLL_CHOICE_REPOSITORY,
  type IPollChoiceRepository,
} from '@modules/poll/domain/repositories/poll-choice-repository.interface';
import {
  POLL_ADDRESS_REPOSITORY,
  type IPollAddressRepository,
} from '@modules/poll/domain/repositories/poll-address-repository.interface';
import { CreatePollDto } from '@modules/poll/application/dto/create-poll.dto';
import {
  Poll,
  TransactionStatus,
} from '@modules/poll/domain/entities/poll.entity';

@Injectable()
export class CreatePollUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    @Inject(POLL_CHOICE_REPOSITORY)
    private readonly pollChoiceRepository: IPollChoiceRepository,
    @Inject(POLL_ADDRESS_REPOSITORY)
    private readonly pollAddressRepository: IPollAddressRepository,
  ) {}

  async execute(createPollDto: CreatePollDto): Promise<Poll> {
    // Check if pool hash already exists
    const existingPoll = await this.pollRepository.findByPollHash(
      createPollDto.pollHash,
    );

    if (existingPoll) {
      throw new ConflictException('Poll with this pool hash already exists');
    }

    // Validate dates
    const startDate = new Date(createPollDto.startDate);
    const endDate = new Date(createPollDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Create poll
    const { choices, addresses, ...pollData } = createPollDto;
    const poll = await this.pollRepository.create({
      ...pollData,
      startDate,
      endDate,
      transactionStatus:
        createPollDto.transactionStatus ?? TransactionStatus.PENDING,
      isActive: createPollDto.isActive ?? false,
    });

    // Create choices
    if (choices && choices.length > 0) {
      await this.pollChoiceRepository.createMany(
        choices.map((choice) => ({
          pollId: poll.id,
          choiceText: choice.choiceText,
        })),
      );
    }

    // Create addresses if provided
    if (addresses && addresses.length > 0) {
      await this.pollAddressRepository.createMany(
        addresses.map((address) => ({
          pollId: poll.id,
          walletAddress: address.walletAddress,
        })),
      );
    }

    // Return poll with relations
    const createdPoll = await this.pollRepository.findWithRelations(poll.id);
    if (!createdPoll) {
      throw new Error('Poll not found after creation');
    }

    return createdPoll;
  }
}
