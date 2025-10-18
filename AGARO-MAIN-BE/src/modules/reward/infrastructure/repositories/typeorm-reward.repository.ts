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

  // Add custom repository methods here
}
