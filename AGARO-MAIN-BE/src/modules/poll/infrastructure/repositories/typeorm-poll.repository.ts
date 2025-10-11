import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  Poll,
  TransactionStatus,
} from '@modules/poll/domain/entities/poll.entity';
import { IPollRepository } from '@modules/poll/domain/repositories/poll-repository.interface';

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
}
