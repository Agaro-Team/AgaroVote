import { Entity, Column, Index, VersionColumn } from 'typeorm';
import { BaseEntity } from '@shared/domain/base.entity';

@Entity('vote_stats')
@Index(['pollId'])
@Index(['choiceId'])
@Index(['pollId', 'choiceId'], { unique: true })
export class VoteStat extends BaseEntity {
  @Column({ name: 'poll_id', type: 'uuid' })
  pollId: string;

  @Column({ name: 'choice_id', type: 'uuid' })
  choiceId: string;

  @Column({ name: 'vote_count', type: 'int', default: 0 })
  voteCount: number;

  @Column({
    name: 'vote_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  votePercentage: number;

  @Column({
    name: 'last_vote_at',
    type: 'timestamp',
    nullable: true,
  })
  lastVoteAt?: Date;

  // Optimistic locking for concurrency control
  @VersionColumn()
  version: number;

  // Domain methods
  incrementVote(timestamp: Date = new Date()): void {
    this.voteCount += 1;
    this.lastVoteAt = timestamp;
  }

  updatePercentage(totalVotes: number): void {
    if (totalVotes === 0) {
      this.votePercentage = 0;
      return;
    }
    this.votePercentage = Number(
      ((this.voteCount / totalVotes) * 100).toFixed(2),
    );
  }

  hasVotes(): boolean {
    return this.voteCount > 0;
  }

  isLeading(otherStats: VoteStat[]): boolean {
    return otherStats.every((stat) => this.voteCount >= stat.voteCount);
  }
}
