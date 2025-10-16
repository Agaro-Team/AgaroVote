import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared/domain/base.entity';
import type { Poll } from '@modules/poll/domain/entities/poll.entity';
import type { PollChoice } from '@modules/poll/domain/entities/poll-choice.entity';

@Entity('votes')
@Index(['pollId'])
@Index(['choiceId'])
@Index(['voterWalletAddress'])
@Index(['voterHash'], { unique: true })
@Index(['pollHash'])
@Index(['votedAt'])
export class Vote extends BaseEntity {
  @Column({ name: 'poll_id', type: 'uuid' })
  pollId: string;

  @Column({ name: 'choice_id', type: 'uuid' })
  choiceId: string;

  @Column({ name: 'voter_wallet_address', type: 'varchar', length: 255 })
  voterWalletAddress: string;

  @Column({ name: 'voter_hash', type: 'varchar', length: 255, unique: true })
  voterHash: string;

  @Column({ name: 'poll_hash', type: 'varchar', length: 255 })
  pollHash: string;

  @Column({
    name: 'transaction_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  transactionHash?: string;

  @Column({ name: 'block_number', type: 'bigint', nullable: true })
  blockNumber?: number;

  @Column({ name: 'signature', type: 'text', nullable: true })
  signature?: string;

  @Column({ name: 'vote_weight', type: 'int', default: 1 })
  voteWeight: number;

  @Column({
    name: 'voted_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  votedAt: Date;

  @Column({ name: 'commit_token', type: 'int', nullable: true })
  commitToken?: number;

  // Relations (lazy loaded to avoid circular dependencies)
  @ManyToOne('Poll', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll?: Poll;

  @ManyToOne('PollChoice', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'choice_id' })
  choice?: PollChoice;

  // Domain methods
  isOnChain(): boolean {
    return !!this.transactionHash && !!this.blockNumber;
  }

  isVerified(): boolean {
    return !!this.signature;
  }

  hasWeight(): boolean {
    return this.voteWeight > 1;
  }

  canBeAudited(): boolean {
    return this.isOnChain() && this.isVerified();
  }
}
