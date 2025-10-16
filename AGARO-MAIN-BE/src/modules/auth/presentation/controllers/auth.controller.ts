import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import {
  GetNonceDto,
  NonceResponseDto,
} from '../../application/dto/get-nonce.dto';
import {
  VerifySignatureDto,
  AuthResponseDto,
} from '../../application/dto/verify-signature.dto';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get a nonce for wallet authentication
   * POST /auth/nonce
   *
   * @example
   * ```json
   * {
   *   "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   * }
   * ```
   *
   * Response:
   * ```json
   * {
   *   "nonce": "abc123...",
   *   "expiresAt": "2024-01-01T12:00:00.000Z"
   * }
   * ```
   */
  @Public()
  @Post('nonce')
  @HttpCode(HttpStatus.OK)
  async getNonce(@Body() dto: GetNonceDto): Promise<NonceResponseDto> {
    const nonce = await this.authService.generateNonce(dto.walletAddress);
    return NonceResponseDto.create(nonce.nonce, nonce.expiresAt);
  }

  /**
   * Verify SIWE signature and get JWT token
   * POST /auth/verify
   *
   * @example
   * ```json
   * {
   *   "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
   *   "message": "localhost wants you to sign in...",
   *   "signature": "0x..."
   * }
   * ```
   *
   * Response:
   * ```json
   * {
   *   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
   *   "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
   *   "expiresIn": 604800
   * }
   * ```
   */
  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifySignature(
    @Body() dto: VerifySignatureDto,
  ): Promise<AuthResponseDto> {
    const { accessToken, expiresIn } = await this.authService.verifySignature(
      dto.message,
      dto.signature,
      dto.walletAddress,
    );

    return AuthResponseDto.create(accessToken, dto.walletAddress, expiresIn);
  }

  /**
   * Cleanup expired nonces (admin endpoint - should be protected or called via cron)
   * POST /auth/cleanup
   */
  @Public() // TODO: Add admin guard in production
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  async cleanupNonces(): Promise<{ deletedCount: number }> {
    const deletedCount = await this.authService.cleanupExpiredNonces();
    return { deletedCount };
  }
}
