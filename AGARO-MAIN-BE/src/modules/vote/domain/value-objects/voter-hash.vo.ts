import { createHash } from 'crypto';

/**
 * Value Object representing a unique voter hash
 * Combines poll ID and wallet address to create a unique identifier
 */
export class VoterHash {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Create a voter hash from poll ID and wallet address
   */
  static create(pollId: string, walletAddress: string): VoterHash {
    if (!pollId || !walletAddress) {
      throw new Error('Poll ID and wallet address are required');
    }

    const normalized = this.normalize(pollId, walletAddress);
    const hash = this.hash(normalized);
    return new VoterHash(hash);
  }

  /**
   * Create from existing hash value (for reconstruction)
   */
  static fromValue(value: string): VoterHash {
    if (!value) {
      throw new Error('Voter hash value is required');
    }
    return new VoterHash(value);
  }

  /**
   * Normalize inputs to ensure consistent hashing
   */
  private static normalize(pollId: string, walletAddress: string): string {
    return `${pollId.toLowerCase()}:${walletAddress.toLowerCase()}`;
  }

  /**
   * Create SHA-256 hash
   */
  private static hash(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  get value(): string {
    return this._value;
  }

  equals(other: VoterHash): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
