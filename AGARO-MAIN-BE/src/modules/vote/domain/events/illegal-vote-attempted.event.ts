/**
 * Domain Event: Illegal Vote Attempted
 * Published when a user attempts to vote but is rejected
 */
export class IllegalVoteAttemptedEvent {
  constructor(
    public readonly pollId: string,
    public readonly voterWalletAddress: string,
    public readonly reason: string,
    public readonly attemptedAt: Date,
    public readonly metadata?: Record<string, any>,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}

  /**
   * Get event name for logging/tracking
   */
  static getEventName(): string {
    return 'vote.illegal.attempted';
  }

  /**
   * Check if this is a duplicate vote attempt
   */
  isDuplicateVoteAttempt(): boolean {
    return (
      this.reason.toLowerCase().includes('already voted') ||
      this.reason.toLowerCase().includes('duplicate')
    );
  }

  /**
   * Check if voter is not eligible
   */
  isEligibilityIssue(): boolean {
    return (
      this.reason.toLowerCase().includes('not eligible') ||
      this.reason.toLowerCase().includes('not authorized')
    );
  }

  /**
   * Check if poll timing issue
   */
  isTimingIssue(): boolean {
    return (
      this.reason.toLowerCase().includes('not started') ||
      this.reason.toLowerCase().includes('ended') ||
      this.reason.toLowerCase().includes('inactive')
    );
  }

  /**
   * Get severity level
   */
  getSeverity(): 'low' | 'medium' | 'high' {
    if (this.isDuplicateVoteAttempt()) return 'medium';
    if (this.isEligibilityIssue()) return 'high';
    return 'low';
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      eventName: IllegalVoteAttemptedEvent.getEventName(),
      pollId: this.pollId,
      voterWalletAddress: this.voterWalletAddress,
      reason: this.reason,
      attemptedAt: this.attemptedAt.toISOString(),
      metadata: this.metadata,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      severity: this.getSeverity(),
      isDuplicateVoteAttempt: this.isDuplicateVoteAttempt(),
      isEligibilityIssue: this.isEligibilityIssue(),
      isTimingIssue: this.isTimingIssue(),
    };
  }
}
