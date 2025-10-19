import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared/domain/base.entity';
import { Poll } from './poll.entity';

@Entity('poll_addresses')
@Index(['pollId'])
@Index(['walletAddress'])
export class PollAddress extends BaseEntity {
  @Column({ name: 'poll_id', type: 'uuid' })
  pollId: string;

  @Column({ name: 'wallet_address', type: 'varchar', length: 255 })
  walletAddress: string;

  @Column({ name: 'leave_hash', type: 'varchar', length: 255, nullable: true })
  leaveHash: string | null;

  @ManyToOne(() => Poll, (poll) => poll.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;
}
