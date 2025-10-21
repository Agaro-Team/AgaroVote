import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum AddressSortBy {
  CREATED_AT = 'createdAt',
  WALLET_ADDRESS = 'walletAddress',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class InvitedAddressFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(AddressSortBy)
  sortBy?: AddressSortBy = AddressSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.ASC;

  @IsOptional()
  @IsString()
  q?: string; // Search query for wallet address
}
