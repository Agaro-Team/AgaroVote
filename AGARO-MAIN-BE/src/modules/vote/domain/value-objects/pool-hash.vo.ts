/**
 * Value Object representing a blockchain pool hash
 * This is the on-chain identifier for a voting pool
 */
export class PoolHash {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Create a pool hash from a string value
   */
  static create(pollHash: string): PoolHash {
    if (!pollHash) {
      throw new Error('Pool hash is required');
    }

    const trimmed = pollHash.trim();

    if (trimmed.length === 0) {
      throw new Error('Pool hash cannot be empty');
    }

    return new PoolHash(trimmed);
  }

  /**
   * Create from Poll entity's pollHash field
   */
  static fromPoll(pollHash: string): PoolHash {
    return this.create(pollHash);
  }

  get value(): string {
    return this._value;
  }

  /**
   * Check if this is likely a blockchain hash (0x prefix)
   */
  isBlockchainHash(): boolean {
    return this._value.startsWith('0x');
  }

  equals(other: PoolHash): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
