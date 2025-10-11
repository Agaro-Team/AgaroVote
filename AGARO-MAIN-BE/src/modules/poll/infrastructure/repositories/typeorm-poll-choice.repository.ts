import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollChoice } from '@modules/poll/domain/entities/poll-choice.entity';
import { IPollChoiceRepository } from '@modules/poll/domain/repositories/poll-choice-repository.interface';

@Injectable()
export class TypeORMPollChoiceRepository implements IPollChoiceRepository {
  constructor(
    @InjectRepository(PollChoice)
    private readonly repository: Repository<PollChoice>,
  ) {}

  async findAll(): Promise<PollChoice[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<PollChoice | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByPollId(pollId: string): Promise<PollChoice[]> {
    return await this.repository.find({
      where: { pollId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(entity: Partial<PollChoice>): Promise<PollChoice> {
    const choice = this.repository.create(entity);
    return await this.repository.save(choice);
  }

  async createMany(choices: Partial<PollChoice>[]): Promise<PollChoice[]> {
    const entities = this.repository.create(choices);
    return await this.repository.save(entities);
  }

  async update(id: string, entity: Partial<PollChoice>): Promise<PollChoice> {
    await this.repository.update(id, entity);
    const choice = await this.findById(id);
    if (!choice) {
      throw new Error('Poll choice not found after update');
    }
    return choice;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByPollId(pollId: string): Promise<boolean> {
    const result = await this.repository.softDelete({ pollId });
    return (result.affected ?? 0) > 0;
  }
}
