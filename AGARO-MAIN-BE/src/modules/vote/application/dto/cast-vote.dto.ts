import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEthereumAddress,
} from 'class-validator';

export class CastVoteDto {
  @IsString()
  @IsNotEmpty()
  pollId: string;

  @IsString()
  @IsNotEmpty()
  choiceId: string;

  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  voterWalletAddress: string;

  @IsString()
  @IsOptional()
  transactionHash?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  blockNumber?: number;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  voteWeight?: number;
}
