import { BaseEntity } from '@/shared/domain/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Reward } from './reward.entity';

@Entity('reward_claims')
@Index(['rewardId'])
@Index(['rewardId', 'walletAddress'], { unique: true })
export class RewardClaims extends BaseEntity {
  @Column({ name: 'reward_id', type: 'uuid' })
  rewardId: string;

  @Column({ name: 'wallet_address', type: 'varchar' })
  walletAddress: string;

  @Column({ name: 'claimed_at', type: 'timestamp' })
  claimedAt: Date;

  @ManyToOne(() => Reward, (reward) => reward.rewardClaims, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reward_id' })
  reward: Reward;
}
