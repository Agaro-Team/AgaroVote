import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@shared/domain/base.entity';

/**
 * Nonce Entity
 *
 * Stores cryptographic nonces used for wallet authentication via SIWE
 * Each nonce is single-use and expires after a short period
 */
@Entity('auth_nonces')
@Index(['walletAddress', 'expiresAt'])
export class Nonce extends BaseEntity {
  @Column({ type: 'varchar', length: 255, name: 'wallet_address' })
  @Index()
  walletAddress: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nonce: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  /**
   * Check if nonce is still valid
   */
  isValid(): boolean {
    return !this.used && new Date() < this.expiresAt;
  }

  /**
   * Mark nonce as used
   */
  markAsUsed(): void {
    this.used = true;
  }

  /**
   * Generate a new random nonce
   */
  static generateNonce(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    );
  }

  /**
   * Create a new nonce for a wallet address
   * Default expiry: 5 minutes
   */
  static createForWallet(
    walletAddress: string,
    expiryMinutes: number = 5,
  ): Nonce {
    const nonce = new Nonce();
    nonce.walletAddress = walletAddress;
    nonce.nonce = this.generateNonce();
    nonce.expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    nonce.used = false;
    return nonce;
  }
}
