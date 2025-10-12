import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { VoteStat } from '@modules/vote/domain/entities/vote-stat.entity';
import { IVoteStatRepository } from '@modules/vote/domain/repositories/vote-stat-repository.interface';

@Injectable()
export class TypeORMVoteStatRepository implements IVoteStatRepository {
  private readonly logger = new Logger(TypeORMVoteStatRepository.name);

  constructor(
    @InjectRepository(VoteStat)
    private readonly repository: Repository<VoteStat>,
  ) {}

  async findAll(): Promise<VoteStat[]> {
    return await this.repository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<VoteStat | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByPollId(pollId: string): Promise<VoteStat[]> {
    return await this.repository.find({
      where: { pollId },
      order: { voteCount: 'DESC' },
    });
  }

  async findByChoiceId(choiceId: string): Promise<VoteStat | null> {
    return await this.repository.findOne({ where: { choiceId } });
  }

  async findOrCreate(pollId: string, choiceId: string): Promise<VoteStat> {
    let stat = await this.repository.findOne({
      where: { pollId, choiceId },
    });

    if (!stat) {
      stat = this.repository.create({
        pollId,
        choiceId,
        voteCount: 0,
        votePercentage: 0,
      });
      stat = await this.repository.save(stat);
    }

    return stat;
  }

  async findByPollAndChoice(
    pollId: string,
    choiceId: string,
  ): Promise<VoteStat | null> {
    return await this.repository.findOne({
      where: { pollId, choiceId },
    });
  }

  /**
   * Increment vote count with optimistic locking
   * Returns true if successful, false if version conflict
   */
  async incrementVoteCount(
    pollId: string,
    choiceId: string,
    timestamp: Date,
  ): Promise<boolean> {
    try {
      // Find or create the stat
      const stat = await this.findOrCreate(pollId, choiceId);

      // Increment the vote count
      stat.incrementVote(timestamp);

      // Save with optimistic locking (version check)
      await this.repository.save(stat);

      return true;
    } catch (error) {
      // Check if it's a version conflict
      if (this.isOptimisticLockError(error)) {
        this.logger.warn(
          `Optimistic lock conflict for poll ${pollId}, choice ${choiceId}`,
        );
        return false;
      }
      throw error;
    }
  }

  /**
   * Update all percentages for a poll (after a vote is casted)
   */
  async updatePercentagesForPoll(pollId: string): Promise<void> {
    const stats = await this.findByPollId(pollId);
    const totalVotes = stats.reduce((sum, stat) => sum + stat.voteCount, 0);

    for (const stat of stats) {
      stat.updatePercentage(totalVotes);
      await this.repository.save(stat);
    }
  }

  /**
   * Get total vote count for a poll
   */
  async getTotalVoteCountForPoll(pollId: string): Promise<number> {
    const stats = await this.findByPollId(pollId);
    return stats.reduce((sum, stat) => sum + stat.voteCount, 0);
  }

  /**
   * Get leading choice for a poll
   */
  async getLeadingChoice(pollId: string): Promise<VoteStat | null> {
    const stats = await this.repository.find({
      where: { pollId },
      order: { voteCount: 'DESC' },
      take: 1,
    });

    return stats.length > 0 ? stats[0] : null;
  }

  /**
   * Recalculate all stats for a poll (useful for data consistency)
   */
  async recalculateStatsForPoll(pollId: string): Promise<void> {
    // This would typically query the votes table and recalculate
    // For now, we just update percentages based on existing counts
    await this.updatePercentagesForPoll(pollId);
  }

  /**
   * Batch update stats with retry on version conflict
   */
  async incrementVoteCountWithRetry(
    pollId: string,
    choiceId: string,
    timestamp: Date,
    maxRetries: number = 3,
  ): Promise<void> {
    let retries = 0;

    while (retries < maxRetries) {
      const success = await this.incrementVoteCount(
        pollId,
        choiceId,
        timestamp,
      );

      if (success) {
        return;
      }

      retries++;
      this.logger.warn(
        `Retry ${retries}/${maxRetries} for incrementing vote count`,
      );

      // Exponential backoff
      await this.sleep(Math.pow(2, retries) * 100);
    }

    throw new Error(
      `Failed to increment vote count after ${maxRetries} retries due to concurrent updates`,
    );
  }

  async create(entity: Partial<VoteStat>): Promise<VoteStat> {
    const stat = this.repository.create(entity);
    return await this.repository.save(stat);
  }

  async update(id: string, entity: Partial<VoteStat>): Promise<VoteStat> {
    await this.repository.update(id, entity);
    const stat = await this.findById(id);
    if (!stat) {
      throw new Error(`VoteStat with id ${id} not found`);
    }
    return stat;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  // Additional save method for convenience
  async save(stat: VoteStat): Promise<VoteStat> {
    return await this.repository.save(stat);
  }

  /**
   * Check if error is an optimistic lock error
   */
  private isOptimisticLockError(error: any): boolean {
    if (error instanceof QueryFailedError) {
      // TypeORM doesn't have a built-in way to detect version conflicts
      // We check for common patterns in error messages
      const message = error.message.toLowerCase();
      return (
        message.includes('version') ||
        message.includes('optimistic') ||
        message.includes('concurrent')
      );
    }
    return false;
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
