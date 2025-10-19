import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '@modules/vote/domain/entities/vote.entity';
import { IVoteRepository } from '@modules/vote/domain/repositories/vote-repository.interface';

@Injectable()
export class TypeORMVoteRepository implements IVoteRepository {
  constructor(
    @InjectRepository(Vote)
    private readonly repository: Repository<Vote>,
  ) {}

  async findAll(): Promise<Vote[]> {
    return await this.repository.find({
      order: { votedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Vote | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByPollId(pollId: string): Promise<Vote[]> {
    return await this.repository.find({
      where: { pollId },
      order: { votedAt: 'DESC' },
    });
  }

  async findByVoterWalletAddress(walletAddress: string): Promise<Vote[]> {
    return await this.repository.find({
      where: { voterWalletAddress: walletAddress },
      order: { votedAt: 'DESC' },
    });
  }

  async hasVoted(pollId: string, voterWalletAddress: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        pollId,
        voterWalletAddress,
      },
    });
    return count > 0;
  }

  async findByPollAndVoter(
    pollId: string,
    voterWalletAddress: string,
  ): Promise<Vote | null> {
    return await this.repository.findOne({
      where: {
        pollId,
        voterWalletAddress,
      },
    });
  }

  async findByPollHash(pollHash: string): Promise<Vote[]> {
    return await this.repository.find({
      where: { pollHash },
      order: { votedAt: 'DESC' },
    });
  }

  async findByTransactionHash(transactionHash: string): Promise<Vote[]> {
    return await this.repository.find({
      where: { transactionHash },
      order: { votedAt: 'DESC' },
    });
  }

  async countByPollId(pollId: string): Promise<number> {
    return await this.repository.count({ where: { pollId } });
  }

  async countByChoiceId(choiceId: string): Promise<number> {
    return await this.repository.count({ where: { choiceId } });
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      pollId?: string;
      voterWalletAddress?: string;
      pollHash?: string;
    },
  ): Promise<{ votes: Vote[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('vote')
      .leftJoinAndSelect('vote.choice', 'choice');

    if (filters?.pollId) {
      query.andWhere('vote.pollId = :pollId', { pollId: filters.pollId });
    }

    if (filters?.voterWalletAddress) {
      query.andWhere('vote.voterWalletAddress = :walletAddress', {
        walletAddress: filters.voterWalletAddress,
      });
    }

    if (filters?.pollHash) {
      query.andWhere('vote.pollHash = :pollHash', {
        pollHash: filters.pollHash,
      });
    }

    query.orderBy('vote.votedAt', 'DESC');

    const [votes, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { votes, total };
  }

  async findPendingBlockchainSync(): Promise<Vote[]> {
    const query = this.repository.createQueryBuilder('vote');

    query.where('vote.transactionHash IS NULL');
    query.orWhere('vote.blockNumber IS NULL');
    query.orderBy('vote.votedAt', 'ASC');

    return await query.getMany();
  }

  async create(entity: Partial<Vote>): Promise<Vote> {
    const vote = this.repository.create(entity);
    return await this.repository.save(vote);
  }

  async update(id: string, entity: Partial<Vote>): Promise<Vote> {
    await this.repository.update(id, entity);
    const vote = await this.findById(id);
    if (!vote) {
      throw new Error(`Vote with id ${id} not found`);
    }
    return vote;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  // Additional save method for convenience (used in use-cases)
  async save(vote: Vote): Promise<Vote> {
    return await this.repository.save(vote);
  }
}
