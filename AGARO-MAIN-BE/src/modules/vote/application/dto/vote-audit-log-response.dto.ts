import {
  VoteAuditLog,
  AuditAction,
  EntityType,
} from '@modules/vote/domain/entities/vote-audit-log.entity';

export class VoteAuditLogResponseDto {
  id: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  performedBy: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  performedAt: Date;
  createdAt: Date;
  isSecurityEvent: boolean;

  static fromEntity(log: VoteAuditLog): VoteAuditLogResponseDto {
    const dto = new VoteAuditLogResponseDto();
    dto.id = log.id;
    dto.action = log.action;
    dto.entityType = log.entityType;
    dto.entityId = log.entityId;
    dto.performedBy = log.performedBy;
    dto.oldValue = log.oldValue;
    dto.newValue = log.newValue;
    dto.ipAddress = log.ipAddress;
    dto.userAgent = log.userAgent;
    dto.metadata = log.metadata;
    dto.performedAt = log.performedAt;
    dto.createdAt = log.createdAt;
    dto.isSecurityEvent = log.isSecurityEvent();
    return dto;
  }

  static fromEntities(logs: VoteAuditLog[]): VoteAuditLogResponseDto[] {
    return logs.map((log) => this.fromEntity(log));
  }
}
