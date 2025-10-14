import { IRepository } from '@shared/domain/repository.interface';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { Poll } from '../entities/poll.entity';
import { PollFilterDto } from '@modules/poll/application/dto/poll-filter.dto';

/**
 * Extended Poll type that includes vote count from JOIN query
 * This allows us to fetch vote counts without cross-module CQRS queries
 */
export interface PollWithVoteCount extends Poll {
  voteCount: number;
}

export interface IPollRepository extends IRepository<Poll> {
  findByPoolHash(poolHash: string): Promise<Poll | null>;
  findByCreatorWallet(walletAddress: string): Promise<Poll[]>;
  findActivePolls(): Promise<Poll[]>;
  findOngoingPolls(): Promise<Poll[]>;

  /**
   * Find poll with relations and vote count via JOIN
   * Returns Poll with voteCount property populated from vote_stats table
   */
  findWithRelations(id: string): Promise<PollWithVoteCount | null>;

  /**
   * Paginated queries that include vote counts via JOIN
   * These methods return PollWithVoteCount to include vote counts in single query
   */
  findAllPaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>>;
  findActivePaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>>;
  findOngoingPaginated(
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>>;
  findByCreatorPaginated(
    walletAddress: string,
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>>;

  updateByPoolHash(poolHash: string, entity: Partial<Poll>): Promise<Poll>;
}

export const POLL_REPOSITORY = Symbol('POLL_REPOSITORY');
