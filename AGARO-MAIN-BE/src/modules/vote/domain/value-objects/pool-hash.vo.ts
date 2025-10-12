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
  static create(poolHash: string): PoolHash {
    if (!poolHash) {
      throw new Error('Pool hash is required');
    }

    const trimmed = poolHash.trim();

    if (trimmed.length === 0) {
      throw new Error('Pool hash cannot be empty');
    }

    return new PoolHash(trimmed);
  }

  /**
   * Create from Poll entity's poolHash field
   */
  static fromPoll(poolHash: string): PoolHash {
    return this.create(poolHash);
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
