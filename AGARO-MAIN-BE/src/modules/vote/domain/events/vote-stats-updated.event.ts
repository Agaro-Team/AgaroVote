/**
 * Domain Event: Vote Stats Updated
 * Published when vote statistics are updated for a poll
 */
export class VoteStatsUpdatedEvent {
  constructor(
    public readonly pollId: string,
    public readonly choiceId: string,
    public readonly previousVoteCount: number,
    public readonly newVoteCount: number,
    public readonly votePercentage: number,
    public readonly totalVotes: number,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Get event name for logging/tracking
   */
  static getEventName(): string {
    return 'vote.stats.updated';
  }

  /**
   * Check if this is the first vote
   */
  isFirstVote(): boolean {
    return this.previousVoteCount === 0 && this.newVoteCount === 1;
  }

  /**
   * Get vote increment
   */
  getIncrement(): number {
    return this.newVoteCount - this.previousVoteCount;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      eventName: VoteStatsUpdatedEvent.getEventName(),
      pollId: this.pollId,
      choiceId: this.choiceId,
      previousVoteCount: this.previousVoteCount,
      newVoteCount: this.newVoteCount,
      votePercentage: this.votePercentage,
      totalVotes: this.totalVotes,
      increment: this.getIncrement(),
      isFirstVote: this.isFirstVote(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
