import { IRepository } from '@shared/domain/repository.interface';
import { Vote } from '../entities/vote.entity';

export const VOTE_REPOSITORY = Symbol('VOTE_REPOSITORY');

export interface IVoteRepository extends IRepository<Vote> {
  /**
   * Find all votes for a specific poll
   */
  findByPollId(pollId: string): Promise<Vote[]>;

  /**
   * Find all votes by a specific voter (wallet address)
   */
  findByVoterWalletAddress(walletAddress: string): Promise<Vote[]>;

  /**
   * Check if a voter has already voted in a poll
   */
  hasVoted(pollId: string, voterWalletAddress: string): Promise<boolean>;

  /**
   * Find vote by poll and voter
   */
  findByPollAndVoter(
    pollId: string,
    voterWalletAddress: string,
  ): Promise<Vote | null>;

  /**
   * Find votes by pool hash (blockchain reference)
   */
  findByPollHash(pollHash: string): Promise<Vote[]>;

  /**
   * Find votes by transaction hash (blockchain transaction)
   */
  findByTransactionHash(transactionHash: string): Promise<Vote[]>;

  /**
   * Count total votes for a poll
   */
  countByPollId(pollId: string): Promise<number>;

  /**
   * Count votes for a specific choice
   */
  countByChoiceId(choiceId: string): Promise<number>;

  /**
   * Get votes with pagination
   */
  findWithPagination(
    page: number,
    limit: number,
    filters?: {
      pollId?: string;
      voterWalletAddress?: string;
      pollHash?: string;
    },
  ): Promise<{ votes: Vote[]; total: number }>;

  /**
   * Find votes that are not yet on-chain
   */
  findPendingBlockchainSync(): Promise<Vote[]>;
}
