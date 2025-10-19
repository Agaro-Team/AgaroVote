import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ClaimRewardDto {
  @IsString()
  @IsNotEmpty()
  pollHash: string;

  @IsString()
  @IsNotEmpty()
  voterWalletAddress: string;

  @IsNumber()
  @IsNotEmpty()
  principalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  rewardAmount: number;
}
