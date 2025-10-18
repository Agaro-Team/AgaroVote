import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '@shared/domain/base.entity';
import type { PollChoice } from './poll-choice.entity';
import type { PollAddress } from './poll-address.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('polls')
@Index(['creatorWalletAddress'])
@Index(['isActive'])
@Index(['isPrivate'])
export class Poll extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ name: 'is_token_required', type: 'boolean', default: false })
  isTokenRequired: boolean;

  @Column({ name: 'reward_share', type: 'int', default: 0 })
  rewardShare: number;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'creator_wallet_address', type: 'varchar', length: 255 })
  creatorWalletAddress: string;

  @Column({
    name: 'synthetic_reward_contract_address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  syntheticRewardContractAddress: string;

  @Column({ name: 'poll_hash', type: 'varchar', length: 255, unique: true })
  pollHash: string;

  @Column({
    name: 'voter_hash',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  voterHash?: string;

  @Column({
    name: 'transaction_status',
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  transactionStatus: TransactionStatus;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany('PollChoice', 'poll', {
    cascade: true,
  })
  choices?: PollChoice[];

  @OneToMany('PollAddress', 'poll', {
    cascade: true,
  })
  addresses?: PollAddress[];

  // Domain methods
  isOngoing(): boolean {
    const now = new Date();
    return (
      this.isActive &&
      now >= this.startDate &&
      now <= this.endDate &&
      this.transactionStatus === TransactionStatus.SUCCESS
    );
  }

  hasEnded(): boolean {
    return new Date() > this.endDate;
  }

  hasStarted(): boolean {
    return new Date() >= this.startDate;
  }

  validateDates(): boolean {
    return this.startDate < this.endDate;
  }

  canVote(walletAddress: string): boolean {
    if (!this.isOngoing()) {
      return false;
    }

    // If poll is private, check if user is in allowed addresses
    if (this.isPrivate && !this.isCreator(walletAddress)) {
      return false;
    }

    // If there are specific addresses, check if user is in the list
    if (this.addresses && this.addresses.length > 0) {
      return this.addresses.some(
        (addr) => addr.walletAddress === walletAddress,
      );
    }

    return true;
  }

  isSupportRewards(): boolean {
    return this.rewardShare > 0;
  }

  isCreator(walletAddress: string): boolean {
    return this.creatorWalletAddress === walletAddress;
  }

  isPending(): boolean {
    return this.transactionStatus === TransactionStatus.PENDING;
  }

  isTransactionSuccessful(): boolean {
    return this.transactionStatus === TransactionStatus.SUCCESS;
  }

  isTransactionFailed(): boolean {
    return this.transactionStatus === TransactionStatus.FAILED;
  }

  isTransactionComplete(): boolean {
    return (
      this.transactionStatus === TransactionStatus.SUCCESS ||
      this.transactionStatus === TransactionStatus.FAILED
    );
  }
}
