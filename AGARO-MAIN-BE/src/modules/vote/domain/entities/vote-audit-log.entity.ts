import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@shared/domain/base.entity';

export enum AuditAction {
  VOTE_CASTED = 'vote_casted',
  VOTE_ATTEMPTED = 'vote_attempted',
  VOTE_REJECTED = 'vote_rejected',
  STATS_UPDATED = 'stats_updated',
  VOTE_VERIFIED = 'vote_verified',
  ILLEGAL_ATTEMPT = 'illegal_attempt',
}

export enum EntityType {
  VOTE = 'vote',
  VOTE_STAT = 'vote_stat',
  POLL = 'poll',
}

@Entity('vote_audit_logs')
@Index(['action'])
@Index(['entityType'])
@Index(['entityId'])
@Index(['performedBy'])
@Index(['performedAt'])
export class VoteAuditLog extends BaseEntity {
  @Column({
    name: 'action',
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @Column({ name: 'entity_id', type: 'varchar', length: 255 })
  entityId: string;

  @Column({ name: 'performed_by', type: 'varchar', length: 255 })
  performedBy: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue?: Record<string, any>;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue?: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({
    name: 'performed_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  performedAt: Date;

  // Domain methods
  static createVoteCasted(
    voteId: string,
    performedBy: string,
    voteData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Partial<VoteAuditLog> {
    return {
      action: AuditAction.VOTE_CASTED,
      entityType: EntityType.VOTE,
      entityId: voteId,
      performedBy,
      newValue: voteData,
      ipAddress,
      userAgent,
      performedAt: new Date(),
    };
  }

  static createIllegalAttempt(
    pollId: string,
    performedBy: string,
    reason: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Partial<VoteAuditLog> {
    return {
      action: AuditAction.ILLEGAL_ATTEMPT,
      entityType: EntityType.POLL,
      entityId: pollId,
      performedBy,
      metadata: {
        reason,
        ...metadata,
      },
      ipAddress,
      userAgent,
      performedAt: new Date(),
    };
  }

  static createStatsUpdated(
    statId: string,
    performedBy: string,
    oldValue: Record<string, any>,
    newValue: Record<string, any>,
  ): Partial<VoteAuditLog> {
    return {
      action: AuditAction.STATS_UPDATED,
      entityType: EntityType.VOTE_STAT,
      entityId: statId,
      performedBy,
      oldValue,
      newValue,
      performedAt: new Date(),
    };
  }

  isSecurityEvent(): boolean {
    return (
      this.action === AuditAction.ILLEGAL_ATTEMPT ||
      this.action === AuditAction.VOTE_REJECTED
    );
  }

  hasIpTracking(): boolean {
    return !!this.ipAddress;
  }
}
