import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetNonceDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  walletAddress: string;
}

export class NonceResponseDto {
  nonce: string;
  expiresAt: Date;

  static create(nonce: string, expiresAt: Date): NonceResponseDto {
    const dto = new NonceResponseDto();
    dto.nonce = nonce;
    dto.expiresAt = expiresAt;
    return dto;
  }
}
