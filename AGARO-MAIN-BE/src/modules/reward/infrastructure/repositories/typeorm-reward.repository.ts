import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../../domain/entities/reward.entity';
import { IRewardRepository } from '../../domain/repositories/reward-repository.interface';

@Injectable()
export class TypeORMRewardRepository implements IRewardRepository {
  constructor(
    @InjectRepository(Reward)
    private readonly repository: Repository<Reward>,
  ) {}

  async save(entity: Reward | Partial<Reward>): Promise<Reward> {
    return await this.repository.save(entity);
  }

  async findAll(): Promise<Reward[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<Reward | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(entity: Partial<Reward>): Promise<Reward> {
    const reward = this.repository.create(entity);
    return await this.repository.save(reward);
  }

  async update(id: string, entity: Partial<Reward>): Promise<Reward> {
    await this.repository.update(id, entity);
    const reward = await this.findById(id);
    if (!reward) {
      throw new Error('Reward not found after update');
    }
    return reward;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByVoteId(voteId: string): Promise<Reward | null> {
    return await this.repository.findOne({ where: { voteId } });
  }

  async findByPollId(pollId: string): Promise<Reward[]> {
    return await this.repository.find({
      where: { pollId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByVoterWalletAddress(walletAddress: string): Promise<Reward[]> {
    return await this.repository.find({
      relations: ['vote', 'poll'],
      where: { voterWalletAddress: walletAddress },
      order: { createdAt: 'DESC' },
    });
  }

  async existsByVoteId(voteId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { voteId } });
    return count > 0;
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      pollId?: string;
      voterWalletAddress?: string;
      claimableOnly?: boolean;
    },
  ): Promise<{ rewards: Reward[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('reward')
      .leftJoinAndSelect('reward.vote', 'vote')
      .leftJoinAndSelect('vote.choice', 'choice')
      .leftJoinAndSelect('reward.poll', 'poll')
      // Add subquery for poll total votes
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(v.id)', 'count')
            .from('votes', 'v')
            .where('v.poll_id = reward.pollId'),
        'pollTotalVotes',
      )
      // Add subquery for choice total votes
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(v2.id)', 'count')
            .from('votes', 'v2')
            .where('v2.choice_id = vote.choiceId'),
        'choiceTotalVotes',
      );

    if (filters?.pollId) {
      query.andWhere('reward.pollId = :pollId', { pollId: filters.pollId });
    }

    if (filters?.voterWalletAddress) {
      query.andWhere('reward.voterWalletAddress = :walletAddress', {
        walletAddress: filters.voterWalletAddress,
      });
    }

    if (filters?.claimableOnly) {
      query.andWhere('reward.claimableAt <= :now', { now: new Date() });
    } else {
      query.andWhere('reward.claimableAt > :now', { now: new Date() });
    }

    query.orderBy('reward.createdAt', 'DESC');

    // Get total count first
    const total = await query.getCount();

    // Apply pagination
    query.skip((page - 1) * limit).take(limit);

    // Get raw and entities to access subquery results
    const rawAndEntities = await query.getRawAndEntities();

    // Define the shape of raw results
    type RawResult = {
      pollTotalVotes: string;
      choiceTotalVotes: string;
    };

    // Map the vote counts from raw results to entities
    const rewards = rawAndEntities.entities.map((reward, index) => {
      const raw = rawAndEntities.raw[index] as RawResult;
      return Object.assign(reward, {
        pollTotalVotes: parseInt(raw.pollTotalVotes || '0', 10) || 0,
        choiceTotalVotes: parseInt(raw.choiceTotalVotes || '0', 10) || 0,
      });
    });

    return { rewards, total };
  }
}
