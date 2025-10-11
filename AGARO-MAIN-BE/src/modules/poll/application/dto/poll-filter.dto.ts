import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionStatus } from '@modules/poll/domain/entities/poll.entity';

export enum PollSortBy {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PollFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(300)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(PollSortBy)
  sortBy?: PollSortBy = PollSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  q?: string; // Search query for title/description

  @IsOptional()
  @IsEnum(TransactionStatus)
  transactionStatus?: TransactionStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
