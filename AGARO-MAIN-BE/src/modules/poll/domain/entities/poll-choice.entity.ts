import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared/domain/base.entity';
import { Poll } from './poll.entity';

@Entity('poll_choices')
@Index(['pollId'])
export class PollChoice extends BaseEntity {
  @Column({ name: 'poll_id', type: 'uuid' })
  pollId: string;

  @Column({ name: 'choice_text', type: 'varchar', length: 500 })
  choiceText: string;

  @ManyToOne(() => Poll, (poll) => poll.choices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;
}
