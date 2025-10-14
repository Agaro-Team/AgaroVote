import { IRepository } from '@shared/domain/repository.interface';
import {
  VoteAuditLog,
  AuditAction,
  EntityType,
} from '../entities/vote-audit-log.entity';

export const VOTE_AUDIT_LOG_REPOSITORY = Symbol('VOTE_AUDIT_LOG_REPOSITORY');

export interface IVoteAuditLogRepository extends IRepository<VoteAuditLog> {
  /**
   * Find audit logs by action type
   */
  findByAction(action: AuditAction): Promise<VoteAuditLog[]>;

  /**
   * Find audit logs by entity
   */
  findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<VoteAuditLog[]>;

  /**
   * Find audit logs by performer (wallet address)
   */
  findByPerformer(performedBy: string): Promise<VoteAuditLog[]>;

  /**
   * Find security events (illegal attempts, rejections)
   */
  findSecurityEvents(limit?: number): Promise<VoteAuditLog[]>;

  /**
   * Find audit logs within a time range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<VoteAuditLog[]>;

  /**
   * Find audit logs with pagination
   */
  findWithPagination(
    page: number,
    limit: number,
    filters?: {
      action?: AuditAction;
      entityType?: EntityType;
      performedBy?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ logs: VoteAuditLog[]; total: number }>;

  /**
   * Count illegal attempts by wallet address
   */
  countIllegalAttemptsByWallet(walletAddress: string): Promise<number>;

  /**
   * Get recent activity for a poll
   */
  getRecentActivityForPoll(
    pollId: string,
    limit?: number,
  ): Promise<VoteAuditLog[]>;
}
