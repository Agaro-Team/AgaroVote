import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  walletAddress: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthJwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate JWT access token for authenticated wallet
   */
  generateAccessToken(walletAddress: string): string {
    const payload: JwtPayload = {
      walletAddress,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync<JwtPayload>(token);
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null {
    return this.jwtService.decode(token);
  }

  /**
   * Get token expiration time in seconds
   */
  getExpiresIn(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    // Convert to seconds (simple conversion for common formats)
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    }
    return parseInt(expiresIn);
  }
}
