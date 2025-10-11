import { IsEnum } from 'class-validator';
import { TransactionStatus } from '@modules/poll/domain/entities/poll.entity';

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  transactionStatus: TransactionStatus;
}
