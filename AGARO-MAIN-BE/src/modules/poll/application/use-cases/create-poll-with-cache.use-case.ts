import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
  NotFoundException,
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
import { CacheService } from '@shared/infrastructure/cache';

/**
 * Use case for storing poll data temporarily in Redis cache
 * This is called by the frontend BEFORE submitting to blockchain
 */
@Injectable()
export class StorePendingPollUseCase {
  // TTL for pending polls (30 minutes - enough time for blockchain confirmation)
  private readonly PENDING_POLL_TTL = 1800; // 30 minutes in seconds

  constructor(private readonly cacheService: CacheService) {}

  async execute(
    createPollDto: CreatePollDto,
    walletAddress: string,
  ): Promise<{ cacheKey: string; expiresIn: number }> {
    // Validate dates
    const startDate = new Date(createPollDto.startDate);
    const endDate = new Date(createPollDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Generate cache key using pollHash (from blockchain)
    const cacheKey = this.cacheService.generateKey(
      'pending-poll',
      createPollDto.pollHash,
    );

    // Check if this pollHash is already pending
    const existingPending = await this.cacheService.get(cacheKey);
    if (existingPending) {
      throw new ConflictException(
        'Poll with this hash is already pending blockchain confirmation',
      );
    }

    // Store complete poll data in cache
    const pendingPollData = {
      ...createPollDto,
      creatorAddress: walletAddress,
      submittedAt: new Date().toISOString(),
      status: 'pending_blockchain_confirmation',
    };

    await this.cacheService.set(
      cacheKey,
      pendingPollData,
      this.PENDING_POLL_TTL,
    );

    return {
      cacheKey,
      expiresIn: this.PENDING_POLL_TTL,
    };
  }
}

/**
 * Use case for activating poll after blockchain confirmation
 * This is called by the event listener when contract emits event
 */
@Injectable()
export class ActivatePollFromCacheUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    @Inject(POLL_CHOICE_REPOSITORY)
    private readonly pollChoiceRepository: IPollChoiceRepository,
    @Inject(POLL_ADDRESS_REPOSITORY)
    private readonly pollAddressRepository: IPollAddressRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(pollHash: string): Promise<Poll> {
    // Generate cache key
    const cacheKey = this.cacheService.generateKey('pending-poll', pollHash);

    // Retrieve pending poll data from cache
    const pendingPollData = await this.cacheService.get<
      CreatePollDto & { creatorAddress: string }
    >(cacheKey);

    if (!pendingPollData) {
      throw new NotFoundException(
        `No pending poll data found for pollHash: ${pollHash}. Cache may have expired or poll was already activated.`,
      );
    }

    // Check if poll already exists in database
    const existingPoll = await this.pollRepository.findByPollHash(pollHash);
    if (existingPoll) {
      // Poll already activated, delete cache and return existing
      await this.cacheService.del(cacheKey);
      throw new ConflictException('Poll already activated');
    }

    // Extract data
    const { choices, addresses, creatorAddress, ...pollData } = pendingPollData;

    // Validate dates again (defensive programming)
    const startDate = new Date(pollData.startDate);
    const endDate = new Date(pollData.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Determine status based on poll type
    const getTransactionStatus = () => {
      if (pollData.isPrivate) {
        return TransactionStatus.SUCCESS;
      }
      return TransactionStatus.SUCCESS; // Blockchain confirmed
    };

    const getIsActive = () => {
      if (pollData.isPrivate) {
        return true;
      }
      // Activate only if blockchain confirmed
      return true;
    };

    const getRewardShare = () => {
      if (pollData.isPrivate) {
        return 0;
      }
      return pollData.rewardShare ?? 0;
    };

    // Create poll in database
    const poll = await this.pollRepository.create({
      ...pollData,
      startDate,
      endDate,
      transactionStatus: getTransactionStatus(),
      isActive: getIsActive(),
      isPrivate: pollData.isPrivate ?? false,
      isTokenRequired: pollData.isTokenRequired ?? false,
      rewardShare: getRewardShare(),
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

    // Create addresses if provided (for private polls)
    if (addresses && addresses.length > 0) {
      await this.pollAddressRepository.createMany(
        addresses.map((address) => ({
          pollId: poll.id,
          walletAddress: address.walletAddress,
          leaveHash: address.leaveHash,
        })),
      );
    }

    // Delete from cache after successful creation
    await this.cacheService.del(cacheKey);

    // Invalidate related caches
    await this.cacheService.delMany([
      'polls:list',
      `user:${creatorAddress.toLowerCase()}:polls`,
    ]);

    // Return poll with relations
    const createdPoll = await this.pollRepository.findWithRelations(poll.id);
    if (!createdPoll) {
      throw new Error('Poll not found after creation');
    }

    return createdPoll;
  }
}

/**
 * DEPRECATED: Keep for backward compatibility but mark as deprecated
 * Use StorePendingPollUseCase + ActivatePollFromCacheUseCase instead
 */
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

  /**
   * @deprecated Use StorePendingPollUseCase for new flows
   * This method is kept for backward compatibility only
   */
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

    const getTransactionStatus = () => {
      if (createPollDto.isPrivate) {
        return TransactionStatus.SUCCESS;
      }
      return createPollDto.transactionStatus ?? TransactionStatus.PENDING;
    };

    const getIsActive = () => {
      if (createPollDto.isPrivate) {
        return true;
      }
      return createPollDto.isActive ?? false;
    };

    const getRewardShare = () => {
      if (createPollDto.isPrivate) {
        return 0;
      }
      return createPollDto.rewardShare ?? 0;
    };

    // Create poll
    const { choices, addresses, ...pollData } = createPollDto;
    const poll = await this.pollRepository.create({
      ...pollData,
      startDate,
      endDate,
      transactionStatus: getTransactionStatus(),
      isActive: getIsActive(),
      isPrivate: createPollDto.isPrivate ?? false,
      isTokenRequired: createPollDto.isTokenRequired ?? false,
      rewardShare: getRewardShare(),
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
          leaveHash: address.leaveHash,
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
