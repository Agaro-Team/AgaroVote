import { IRepository } from '../../../../shared/domain/repository.interface';
import { User } from '../entities/user.entity';

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findActiveUsers(): Promise<User[]>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
