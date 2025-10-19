import { BaseEntity } from '@/shared/domain/base.entity';
import type { Poll } from '@modules/poll/domain/entities/poll.entity';
import type { Vote } from '@modules/vote/domain/entities/vote.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('vote_rewards')
@Index(['voteId'])
@Index(['pollId'])
@Index(['voteId', 'pollId'], { unique: true })
export class Reward extends BaseEntity {
  @Column({ name: 'vote_id', type: 'uuid' })
  voteId: string;

  @Column({ name: 'voter_wallet_address', type: 'varchar' })
  voterWalletAddress: string;

  @Column({ name: 'poll_id', type: 'uuid' })
  pollId: string;

  @Column({
    name: 'principal_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
  })
  principalAmount: number;

  @Column({
    name: 'reward_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
  })
  rewardAmount: number;

  @Column({ name: 'claimable_at', type: 'timestamp', default: null })
  claimableAt: Date;

  @Column({ name: 'claimed_at', type: 'timestamp', default: null })
  claimedAt?: Date;

  // Relations
  @ManyToOne('Vote', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vote_id' })
  vote?: Vote;

  @ManyToOne('Poll', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll?: Poll;

  isClaimable(): boolean {
    return this.claimableAt && this.claimableAt <= new Date();
  }

  isClaimed(): boolean {
    return !!this.claimedAt;
  }

  // Transient properties (not persisted, populated by queries)
  pollTotalVotes?: number;
  choiceTotalVotes?: number;
}
