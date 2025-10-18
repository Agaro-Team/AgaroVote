/**
 * Domain Event: Vote Casted
 * Published when a user successfully casts a vote
 */
export class VoteCastedEvent {
  constructor(
    public readonly voteId: string,
    public readonly pollId: string,
    public readonly choiceId: string,
    public readonly voterWalletAddress: string,
    public readonly pollHash: string,
    public readonly votedAt: Date,
    public readonly transactionHash?: string,
    public readonly blockNumber?: number,
    public readonly signature?: string,
  ) {}

  /**
   * Get event name for logging/tracking
   */
  static getEventName(): string {
    return 'vote.casted';
  }

  /**
   * Check if vote is on-chain
   */
  isOnChain(): boolean {
    return !!this.transactionHash && !!this.blockNumber;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      eventName: VoteCastedEvent.getEventName(),
      voteId: this.voteId,
      pollId: this.pollId,
      choiceId: this.choiceId,
      voterWalletAddress: this.voterWalletAddress,
      pollHash: this.pollHash,
      votedAt: this.votedAt.toISOString(),
      transactionHash: this.transactionHash,
      blockNumber: this.blockNumber,
      signature: this.signature,
      isOnChain: this.isOnChain(),
    };
  }
}
