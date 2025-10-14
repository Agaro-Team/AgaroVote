import { IRepository } from '@shared/domain/repository.interface';
import { VoteStat } from '../entities/vote-stat.entity';

export const VOTE_STAT_REPOSITORY = Symbol('VOTE_STAT_REPOSITORY');

export interface IVoteStatRepository extends IRepository<VoteStat> {
  /**
   * Find statistics for a specific poll
   */
  findByPollId(pollId: string): Promise<VoteStat[]>;

  /**
   * Find statistics for multiple polls (batch query for performance)
   */
  findByPollIds(pollIds: string[]): Promise<VoteStat[]>;

  /**
   * Find statistics for a specific choice
   */
  findByChoiceId(choiceId: string): Promise<VoteStat | null>;

  /**
   * Find or create a vote stat entry
   */
  findOrCreate(pollId: string, choiceId: string): Promise<VoteStat>;

  /**
   * Find stat by poll and choice
   */
  findByPollAndChoice(
    pollId: string,
    choiceId: string,
  ): Promise<VoteStat | null>;

  /**
   * Increment vote count with optimistic locking
   * Returns true if successful, false if version conflict
   */
  incrementVoteCount(
    pollId: string,
    choiceId: string,
    timestamp: Date,
  ): Promise<boolean>;

  /**
   * Update all percentages for a poll (after a vote is casted)
   */
  updatePercentagesForPoll(pollId: string): Promise<void>;

  /**
   * Get total vote count for a poll
   */
  getTotalVoteCountForPoll(pollId: string): Promise<number>;

  /**
   * Get leading choice for a poll
   */
  getLeadingChoice(pollId: string): Promise<VoteStat | null>;

  /**
   * Recalculate all stats for a poll (useful for data consistency)
   */
  recalculateStatsForPoll(pollId: string): Promise<void>;

  /**
   * Batch update stats with retry on version conflict
   */
  incrementVoteCountWithRetry(
    pollId: string,
    choiceId: string,
    timestamp: Date,
    maxRetries?: number,
  ): Promise<void>;
}
