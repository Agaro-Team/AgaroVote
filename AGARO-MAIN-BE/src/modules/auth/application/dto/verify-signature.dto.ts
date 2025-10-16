import { IsNotEmpty, IsString, IsEthereumAddress } from 'class-validator';

export class VerifySignatureDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @IsEthereumAddress()
  walletAddress: string;
}

export class AuthResponseDto {
  accessToken: string;
  walletAddress: string;
  expiresIn: number;

  static create(
    accessToken: string,
    walletAddress: string,
    expiresIn: number,
  ): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.accessToken = accessToken;
    dto.walletAddress = walletAddress;
    dto.expiresIn = expiresIn;
    return dto;
  }
}
