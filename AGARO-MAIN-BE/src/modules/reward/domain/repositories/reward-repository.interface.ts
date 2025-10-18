import { IRepository } from '../../../../shared/domain/repository.interface';
import { Reward } from '../entities/reward.entity';

export type IRewardRepository = IRepository<Reward>;

export const REWARD_REPOSITORY = Symbol('REWARD_REPOSITORY');
