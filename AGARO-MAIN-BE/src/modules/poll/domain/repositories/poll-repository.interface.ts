import { IRepository } from '@shared/domain/repository.interface';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { Poll } from '../entities/poll.entity';
import { PollFilterDto } from '@modules/poll/application/dto/poll-filter.dto';

export interface IPollRepository extends IRepository<Poll> {
  findByPoolHash(poolHash: string): Promise<Poll | null>;
  findByCreatorWallet(walletAddress: string): Promise<Poll[]>;
  findActivePolls(): Promise<Poll[]>;
  findOngoingPolls(): Promise<Poll[]>;
  findWithRelations(id: string): Promise<Poll | null>;
  findAllPaginated(filters: PollFilterDto): Promise<IPaginatedResult<Poll>>;
  findActivePaginated(filters: PollFilterDto): Promise<IPaginatedResult<Poll>>;
  findOngoingPaginated(filters: PollFilterDto): Promise<IPaginatedResult<Poll>>;
  findByCreatorPaginated(
    walletAddress: string,
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<Poll>>;
  updateByPoolHash(poolHash: string, entity: Partial<Poll>): Promise<Poll>;
}

export const POLL_REPOSITORY = Symbol('POLL_REPOSITORY');
