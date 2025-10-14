import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetVotesQueryDto {
  @IsOptional()
  @IsString()
  pollId?: string;

  @IsOptional()
  @IsString()
  voterWalletAddress?: string;

  @IsOptional()
  @IsString()
  poolHash?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
