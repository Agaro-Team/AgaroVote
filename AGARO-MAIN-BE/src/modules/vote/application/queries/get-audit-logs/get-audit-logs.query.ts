import { IQuery } from '@nestjs/cqrs';
import {
  AuditAction,
  EntityType,
} from '@modules/vote/domain/entities/vote-audit-log.entity';

export class GetAuditLogsQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly filters?: {
      action?: AuditAction;
      entityType?: EntityType;
      performedBy?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {}
}
