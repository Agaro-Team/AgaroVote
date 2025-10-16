import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SiweMessage } from 'siwe';
import { Nonce } from '../../domain/entities/nonce.entity';
import { NONCE_REPOSITORY } from '../../domain/repositories/nonce-repository.interface';
import type { INonceRepository } from '../../domain/repositories/nonce-repository.interface';
import { AuthJwtService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(NONCE_REPOSITORY)
    private readonly nonceRepository: INonceRepository,
    private readonly jwtService: AuthJwtService,
  ) {}

  /**
   * Generate a new nonce for wallet authentication
   */
  async generateNonce(walletAddress: string): Promise<Nonce> {
    const nonce = Nonce.createForWallet(walletAddress);
    return this.nonceRepository.save(nonce);
  }

  /**
   * Verify SIWE signature and return JWT token
   */
  async verifySignature(
    message: string,
    signature: string,
    walletAddress: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Normalize line endings: SIWE expects \n but may receive \r\n
      const normalizedMessage = message.replace(/\r\n/g, '\n');

      // Parse SIWE message
      const siweMessage = new SiweMessage(normalizedMessage);
      // Verify the signature matches the message
      const fields = await siweMessage.verify({ signature });

      // Check if verification was successful
      if (!fields.success) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Verify the wallet address matches
      if (fields.data.address.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new UnauthorizedException('Wallet address mismatch');
      }

      // Verify nonce exists and is valid
      const nonce = await this.nonceRepository.findValidNonce(
        siweMessage.nonce,
      );

      if (!nonce) {
        throw new UnauthorizedException('Invalid or expired nonce');
      }

      if (!nonce.isValid()) {
        throw new UnauthorizedException('Nonce has expired or been used');
      }

      // Verify nonce belongs to the wallet
      if (nonce.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new UnauthorizedException('Nonce does not belong to this wallet');
      }

      // Mark nonce as used to prevent replay attacks
      await this.nonceRepository.markAsUsed(nonce.nonce);

      // Generate JWT token
      const accessToken = this.jwtService.generateAccessToken(walletAddress);
      const expiresIn = this.jwtService.getExpiresIn();

      return { accessToken, expiresIn };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle SIWE parsing errors
      console.error('SIWE verification error:', error);

      if (error instanceof Error) {
        if (error.message?.includes('Invalid message')) {
          throw new BadRequestException(
            `Invalid SIWE message format: ${error.message}`,
          );
        }

        throw new UnauthorizedException(
          `Signature verification failed: ${error.message}`,
        );
      }

      throw new UnauthorizedException(
        'Signature verification failed: Unknown error',
      );
    }
  }

  /**
   * Validate JWT token and extract wallet address
   */
  async validateToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyToken(token);
      return payload.walletAddress;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Cleanup expired nonces (should be run periodically)
   */
  async cleanupExpiredNonces(): Promise<number> {
    return this.nonceRepository.deleteExpired();
  }
}
