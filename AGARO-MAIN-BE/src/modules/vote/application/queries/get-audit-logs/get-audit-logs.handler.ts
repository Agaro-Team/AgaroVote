import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAuditLogsQuery } from './get-audit-logs.query';
import {
  VOTE_AUDIT_LOG_REPOSITORY,
  type IVoteAuditLogRepository,
} from '@modules/vote/domain/repositories/vote-audit-log-repository.interface';
import { VoteAuditLog } from '@modules/vote/domain/entities/vote-audit-log.entity';

export interface PaginatedAuditLogsResult {
  logs: VoteAuditLog[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(GetAuditLogsQuery)
export class GetAuditLogsHandler implements IQueryHandler<GetAuditLogsQuery> {
  constructor(
    @Inject(VOTE_AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IVoteAuditLogRepository,
  ) {}

  async execute(query: GetAuditLogsQuery): Promise<PaginatedAuditLogsResult> {
    const { logs, total } = await this.auditLogRepository.findWithPagination(
      query.page,
      query.limit,
      query.filters,
    );

    return {
      logs,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
