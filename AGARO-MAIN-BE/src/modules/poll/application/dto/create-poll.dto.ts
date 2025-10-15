import {
  IsString,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionStatus } from '@modules/poll/domain/entities/poll.entity';

export class CreatePollChoiceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  choiceText: string;
}

export class CreatePollAddressDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  walletAddress: string;
}

export class CreatePollDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsBoolean()
  isPrivate: boolean;

  @IsBoolean()
  isTokenRequired: boolean;

  @IsNumber()
  @IsOptional()
  rewardShare?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  creatorWalletAddress: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  pollHash: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  transactionStatus?: TransactionStatus = TransactionStatus.PENDING;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = false;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePollChoiceDto)
  @ArrayMinSize(2, { message: 'Poll must have at least 2 choices' })
  choices: CreatePollChoiceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePollAddressDto)
  addresses?: CreatePollAddressDto[];
}
