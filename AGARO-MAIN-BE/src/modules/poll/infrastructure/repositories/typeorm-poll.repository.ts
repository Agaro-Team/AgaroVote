import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  SelectQueryBuilder,
} from 'typeorm';
import {
  Poll,
  TransactionStatus,
} from '@modules/poll/domain/entities/poll.entity';
import {
  IPollRepository,
  PollWithVoteCount,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { PollFilterDto } from '@modules/poll/application/dto/poll-filter.dto';

@Injectable()
export class TypeORMPollRepository implements IPollRepository {
  constructor(
    @InjectRepository(Poll)
    private readonly repository: Repository<Poll>,
  ) {}

  async findAll(): Promise<Poll[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<Poll | null> {
    return await this.repository.findOne({ where: { id } });
  }

  /**
   * Find poll with relations and vote count via SUBQUERY
   * Uses subquery to get vote count - cleaner than JOIN with GROUP BY
   */
  async findWithRelations(id: string): Promise<PollWithVoteCount | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.choices', 'choices')
      .leftJoinAndSelect('poll.addresses', 'addresses')
      .where('poll.id = :id', { id });

    // Add vote count via subquery
    this.addVoteCountSelect(queryBuilder);

    const rawAndEntities = await queryBuilder.getRawAndEntities<{
      votecount: string;
    }>();

    if (rawAndEntities.entities.length === 0) {
      return null;
    }

    const poll = rawAndEntities.entities[0];
    const voteCount = parseInt(rawAndEntities.raw[0]?.votecount) || 0;

    // Preserve the Poll class instance and its methods by using Object.assign
    return Object.assign(poll, { voteCount }) as PollWithVoteCount;
  }

  async findByPollHash(pollHash: string): Promise<Poll | null> {
    return await this.repository.findOne({ where: { pollHash } });
  }

  async findByCreatorWallet(walletAddress: string): Promise<Poll[]> {
    return await this.repository.find({
      where: { creatorWalletAddress: walletAddress },
      relations: ['choices', 'addresses'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActivePolls(): Promise<Poll[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ['choices', 'addresses'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOngoingPolls(): Promise<Poll[]> {
    const now = new Date();
    return await this.repository.find({
      where: {
        isActive: true,
        transactionStatus: TransactionStatus.SUCCESS,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      relations: ['choices', 'addresses'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(entity: Partial<Poll>): Promise<Poll> {
    const poll = this.repository.create(entity);
    return await this.repository.save(poll);
  }

  async update(id: string, entity: Partial<Poll>): Promise<Poll> {
    await this.repository.update(id, entity);
    const poll = await this.findById(id);
    if (!poll) {
      throw new Error('Poll not found after update');
    }
    return poll;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Find all polls paginated with vote counts via JOIN
   */
  async findAllPaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>> {
    const queryBuilder = this.repository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.choices', 'choices')
      .leftJoinAndSelect('poll.addresses', 'addresses');

    this.addVoteCountSelect(queryBuilder);
    this.applyFilters(queryBuilder, filters);
    return await this.paginateWithVoteCount(queryBuilder, filters);
  }

  /**
   * Find active polls paginated with vote counts via JOIN
   */
  async findActivePaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>> {
    const queryBuilder = this.repository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.choices', 'choices')
      .leftJoinAndSelect('poll.addresses', 'addresses')
      .where('poll.isActive = :isActive', { isActive: true });

    this.addVoteCountSelect(queryBuilder);
    this.applyFilters(queryBuilder, filters);
    return await this.paginateWithVoteCount(queryBuilder, filters);
  }

  /**
   * Find ongoing polls paginated with vote counts via JOIN
   */
  async findOngoingPaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>> {
    const now = new Date();
    const queryBuilder = this.repository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.choices', 'choices')
      .leftJoinAndSelect('poll.addresses', 'addresses')
      .where('poll.isActive = :isActive', { isActive: true })
      .andWhere('poll.transactionStatus = :status', {
        status: TransactionStatus.SUCCESS,
      })
      .andWhere('poll.startDate <= :now', { now })
      .andWhere('poll.endDate >= :now', { now });

    this.addVoteCountSelect(queryBuilder);
    this.applyFilters(queryBuilder, filters);
    return await this.paginateWithVoteCount(queryBuilder, filters);
  }

  /**
   * Find polls by creator paginated with vote counts via JOIN
   */
  async findByCreatorPaginated(
    walletAddress: string,
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>> {
    const queryBuilder = this.repository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.choices', 'choices')
      .leftJoinAndSelect('poll.addresses', 'addresses')
      .where('poll.creatorWalletAddress = :walletAddress', { walletAddress });

    this.addVoteCountSelect(queryBuilder);
    this.applyFilters(queryBuilder, filters);
    return await this.paginateWithVoteCount(queryBuilder, filters);
  }

  /**
   * Helper method to add vote count to query via SUBQUERY
   * This avoids the GROUP BY complexity and returns one row per poll
   *
   * SQL generated:
   * SELECT (
   *   SELECT COALESCE(SUM(vs.vote_count), 0)
   *   FROM vote_stats vs
   *   WHERE vs.poll_id = poll.id
   * ) as voteCount
   */
  private addVoteCountSelect(
    queryBuilder: SelectQueryBuilder<Poll>,
  ): SelectQueryBuilder<Poll> {
    return queryBuilder.addSelect(
      (subQuery) =>
        subQuery
          .select('COALESCE(SUM(vs.vote_count), 0)', 'sum')
          .from('vote_stats', 'vs')
          .where('vs.poll_id = poll.id'),
      'voteCount',
    );
  }

  /**
   * Paginate query results with vote count
   * Maps raw results to PollWithVoteCount entities
   *
   * Using subquery approach - each poll returns exactly one row
   * with its aggregated vote count, avoiding GROUP BY complexity
   */
  private async paginateWithVoteCount(
    queryBuilder: SelectQueryBuilder<Poll>,
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination to main query
    queryBuilder.skip(skip).take(limit);

    // Define the shape of raw query results
    type RawPollResult = {
      poll_id: string;
      voteCount: string;
      [key: string]: unknown; // Other columns from joins
    };

    const rawAndEntities =
      await queryBuilder.getRawAndEntities<RawPollResult>();

    // Map entities to include vote counts from raw results
    // Note: When using leftJoinAndSelect, raw array contains duplicate rows for each joined relation
    // but entities array contains unique entities with relations already mapped
    // We need to match each entity to its corresponding raw row by poll.id
    // Build a lookup map for raw rows by poll_id for O(1) access
    const rawRowMap = new Map<string, RawPollResult>();
    for (const row of rawAndEntities.raw) {
      rawRowMap.set(row.poll_id, row);
    }

    const data = rawAndEntities.entities.map((poll) => {
      // Get the raw row that corresponds to this poll entity
      const rawRow = rawRowMap.get(poll.id);
      const voteCount = parseInt(rawRow?.voteCount ?? '0') || 0;

      return Object.assign(poll, { voteCount }) as PollWithVoteCount;
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Poll>,
    filters: PollFilterDto,
  ): void {
    // Display public only
    queryBuilder.andWhere('poll.isPrivate = :isPrivate', { isPrivate: false });

    // Search query (q) - searches in title and description
    if (filters.q) {
      queryBuilder.andWhere(
        '(poll.title ILIKE :search OR poll.description ILIKE :search)',
        { search: `%${filters.q}%` },
      );
    }

    // Transaction status filter
    if (filters.transactionStatus) {
      queryBuilder.andWhere('poll.transactionStatus = :transactionStatus', {
        transactionStatus: filters.transactionStatus,
      });
    }

    // Is private filter
    if (filters.isPrivate !== undefined) {
      queryBuilder.andWhere('poll.isPrivate = :isPrivate', {
        isPrivate: filters.isPrivate,
      });
    }

    // Is active filter
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('poll.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order || 'DESC';
    queryBuilder.orderBy(`poll.${sortBy}`, order);
  }

  async updateByPollHash(
    pollHash: string,
    entity: Partial<Poll>,
  ): Promise<Poll> {
    await this.repository.update({ pollHash }, entity);
    const poll = await this.findByPollHash(pollHash);
    if (!poll) {
      throw new Error('Poll not found after update');
    }
    return poll;
  }

  async save(poll: Poll | Partial<Poll>): Promise<Poll> {
    return await this.repository.save(poll);
  }
}
