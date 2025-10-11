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
import { IPollRepository } from '@modules/poll/domain/repositories/poll-repository.interface';
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

  async findWithRelations(id: string): Promise<Poll | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['choices', 'addresses'],
    });
  }

  async findByPoolHash(poolHash: string): Promise<Poll | null> {
    return await this.repository.findOne({ where: { poolHash } });
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

  async findAllPaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<Poll>> {
    const queryBuilder = this.repository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.choices', 'choices')
      .leftJoinAndSelect('poll.addresses', 'addresses');

    this.applyFilters(queryBuilder, filters);
    return await this.paginate(queryBuilder, filters);
  }

  async findActivePaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<Poll>> {
    const queryBuilder = this.repository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.choices', 'choices')
      .leftJoinAndSelect('poll.addresses', 'addresses')
      .where('poll.isActive = :isActive', { isActive: true });

    this.applyFilters(queryBuilder, filters);
    return await this.paginate(queryBuilder, filters);
  }

  async findOngoingPaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<Poll>> {
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

    this.applyFilters(queryBuilder, filters);
    return await this.paginate(queryBuilder, filters);
  }

  async findByCreatorPaginated(
    walletAddress: string,
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<Poll>> {
    const queryBuilder = this.repository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.choices', 'choices')
      .leftJoinAndSelect('poll.addresses', 'addresses')
      .where('poll.creatorWalletAddress = :walletAddress', { walletAddress });

    this.applyFilters(queryBuilder, filters);
    return await this.paginate(queryBuilder, filters);
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Poll>,
    filters: PollFilterDto,
  ): void {
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

  private async paginate(
    queryBuilder: SelectQueryBuilder<Poll>,
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<Poll>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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

  async updateByPoolHash(
    poolHash: string,
    entity: Partial<Poll>,
  ): Promise<Poll> {
    await this.repository.update({ poolHash }, entity);
    const poll = await this.findByPoolHash(poolHash);
    if (!poll) {
      throw new Error('Poll not found after update');
    }
    return poll;
  }
}
