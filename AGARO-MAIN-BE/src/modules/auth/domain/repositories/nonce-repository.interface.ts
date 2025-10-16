import { Nonce } from '../entities/nonce.entity';

export const NONCE_REPOSITORY = 'NONCE_REPOSITORY';

export interface INonceRepository {
  /**
   * Save a nonce
   */
  save(nonce: Nonce): Promise<Nonce>;

  /**
   * Find a valid nonce by value
   */
  findValidNonce(nonceValue: string): Promise<Nonce | null>;

  /**
   * Find the latest nonce for a wallet address
   */
  findLatestByWallet(walletAddress: string): Promise<Nonce | null>;

  /**
   * Delete expired nonces (cleanup job)
   */
  deleteExpired(): Promise<number>;

  /**
   * Mark nonce as used
   */
  markAsUsed(nonceValue: string): Promise<void>;
}
