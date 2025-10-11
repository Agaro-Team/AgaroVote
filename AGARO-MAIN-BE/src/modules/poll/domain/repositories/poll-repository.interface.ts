import { IRepository } from '@shared/domain/repository.interface';
import { Poll } from '../entities/poll.entity';

export interface IPollRepository extends IRepository<Poll> {
  findByPoolHash(poolHash: string): Promise<Poll | null>;
  findByCreatorWallet(walletAddress: string): Promise<Poll[]>;
  findActivePolls(): Promise<Poll[]>;
  findOngoingPolls(): Promise<Poll[]>;
  findWithRelations(id: string): Promise<Poll | null>;
}

export const POLL_REPOSITORY = Symbol('POLL_REPOSITORY');
