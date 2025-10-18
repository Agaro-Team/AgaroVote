import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetRewardsQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  pollId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  claimableOnly?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
