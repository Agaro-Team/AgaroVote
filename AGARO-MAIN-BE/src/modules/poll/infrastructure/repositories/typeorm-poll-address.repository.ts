import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollAddress } from '@modules/poll/domain/entities/poll-address.entity';
import { IPollAddressRepository } from '@modules/poll/domain/repositories/poll-address-repository.interface';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { InvitedAddressFilterDto } from '@modules/poll/application/dto/invited-address-filter.dto';

@Injectable()
export class TypeORMPollAddressRepository implements IPollAddressRepository {
  constructor(
    @InjectRepository(PollAddress)
    private readonly repository: Repository<PollAddress>,
  ) {}

  async findAll(): Promise<PollAddress[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<PollAddress | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByPollId(pollId: string): Promise<PollAddress[]> {
    return await this.repository.find({
      where: { pollId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByPollIdPaginated(
    pollId: string,
    filters: InvitedAddressFilterDto,
  ): Promise<IPaginatedResult<PollAddress>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order || 'ASC';

    const queryBuilder = this.repository
      .createQueryBuilder('address')
      .where('address.pollId = :pollId', { pollId });

    // Apply search filter if provided
    if (filters.q) {
      queryBuilder.andWhere('address.walletAddress ILIKE :search', {
        search: `%${filters.q}%`,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`address.${sortBy}`, order);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Get paginated data
    const data = await queryBuilder.getMany();

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

  async findByWalletAddress(walletAddress: string): Promise<PollAddress[]> {
    return await this.repository.find({
      where: { walletAddress },
      relations: ['poll'],
      order: { createdAt: 'DESC' },
    });
  }

  async isWalletAllowed(
    pollId: string,
    walletAddress: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: { pollId, walletAddress },
    });
    return count > 0;
  }

  async create(entity: Partial<PollAddress>): Promise<PollAddress> {
    const address = this.repository.create(entity);
    return await this.repository.save(address);
  }

  async createMany(addresses: Partial<PollAddress>[]): Promise<PollAddress[]> {
    const entities = this.repository.create(addresses);
    return await this.repository.save(entities);
  }

  async update(id: string, entity: Partial<PollAddress>): Promise<PollAddress> {
    await this.repository.update(id, entity);
    const address = await this.findById(id);
    if (!address) {
      throw new Error('Poll address not found after update');
    }
    return address;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByPollId(pollId: string): Promise<boolean> {
    const result = await this.repository.softDelete({ pollId });
    return (result.affected ?? 0) > 0;
  }

  async save(
    address: PollAddress | Partial<PollAddress>,
  ): Promise<PollAddress> {
    return await this.repository.save(address);
  }

  async findByPollAndAddress(
    pollId: string,
    walletAddress: string,
  ): Promise<PollAddress | null> {
    return await this.repository.findOne({
      where: { pollId, walletAddress },
    });
  }
}
