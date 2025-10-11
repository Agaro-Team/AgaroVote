import { IRepository } from '@shared/domain/repository.interface';
import { PollChoice } from '../entities/poll-choice.entity';

export interface IPollChoiceRepository extends IRepository<PollChoice> {
  findByPollId(pollId: string): Promise<PollChoice[]>;
  deleteByPollId(pollId: string): Promise<boolean>;
  createMany(choices: Partial<PollChoice>[]): Promise<PollChoice[]>;
}

export const POLL_CHOICE_REPOSITORY = Symbol('POLL_CHOICE_REPOSITORY');
