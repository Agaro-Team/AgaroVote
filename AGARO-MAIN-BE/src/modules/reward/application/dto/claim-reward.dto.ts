import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimRewardDto {
  @IsString()
  @IsNotEmpty()
  pollHash: string;

  @IsString()
  @IsNotEmpty()
  voterWalletAddress: string;

  @IsString()
  @IsNotEmpty()
  principalAmount: string;

  @IsString()
  @IsNotEmpty()
  rewardAmount: string;
}
