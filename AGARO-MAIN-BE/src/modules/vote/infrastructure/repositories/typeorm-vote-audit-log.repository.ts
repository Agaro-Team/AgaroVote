import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  VoteAuditLog,
  AuditAction,
  EntityType,
} from '@modules/vote/domain/entities/vote-audit-log.entity';
import { IVoteAuditLogRepository } from '@modules/vote/domain/repositories/vote-audit-log-repository.interface';

@Injectable()
export class TypeORMVoteAuditLogRepository implements IVoteAuditLogRepository {
  constructor(
    @InjectRepository(VoteAuditLog)
    private readonly repository: Repository<VoteAuditLog>,
  ) {}

  async findAll(): Promise<VoteAuditLog[]> {
    return await this.repository.find({
      order: { performedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<VoteAuditLog | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByAction(action: AuditAction): Promise<VoteAuditLog[]> {
    return await this.repository.find({
      where: { action },
      order: { performedAt: 'DESC' },
    });
  }

  async findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<VoteAuditLog[]> {
    return await this.repository.find({
      where: { entityType, entityId },
      order: { performedAt: 'DESC' },
    });
  }

  async findByPerformer(performedBy: string): Promise<VoteAuditLog[]> {
    return await this.repository.find({
      where: { performedBy },
      order: { performedAt: 'DESC' },
    });
  }

  async findSecurityEvents(limit: number = 100): Promise<VoteAuditLog[]> {
    return await this.repository.find({
      where: [
        { action: AuditAction.ILLEGAL_ATTEMPT },
        { action: AuditAction.VOTE_REJECTED },
      ],
      order: { performedAt: 'DESC' },
      take: limit,
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<VoteAuditLog[]> {
    return await this.repository.find({
      where: {
        performedAt: Between(startDate, endDate),
      },
      order: { performedAt: 'DESC' },
    });
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      action?: AuditAction;
      entityType?: EntityType;
      performedBy?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ logs: VoteAuditLog[]; total: number }> {
    const query = this.repository.createQueryBuilder('log');

    if (filters?.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters?.entityType) {
      query.andWhere('log.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters?.performedBy) {
      query.andWhere('log.performedBy = :performedBy', {
        performedBy: filters.performedBy,
      });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('log.performedAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters?.startDate) {
      query.andWhere('log.performedAt >= :startDate', {
        startDate: filters.startDate,
      });
    } else if (filters?.endDate) {
      query.andWhere('log.performedAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    query.orderBy('log.performedAt', 'DESC');

    const [logs, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { logs, total };
  }

  async countIllegalAttemptsByWallet(walletAddress: string): Promise<number> {
    return await this.repository.count({
      where: {
        performedBy: walletAddress,
        action: AuditAction.ILLEGAL_ATTEMPT,
      },
    });
  }

  async getRecentActivityForPoll(
    pollId: string,
    limit: number = 50,
  ): Promise<VoteAuditLog[]> {
    return await this.repository.find({
      where: {
        entityId: pollId,
        entityType: EntityType.POLL,
      },
      order: { performedAt: 'DESC' },
      take: limit,
    });
  }

  async create(entity: Partial<VoteAuditLog>): Promise<VoteAuditLog> {
    const log = this.repository.create(entity);
    return await this.repository.save(log);
  }

  async update(
    id: string,
    entity: Partial<VoteAuditLog>,
  ): Promise<VoteAuditLog> {
    await this.repository.update(id, entity);
    const log = await this.findById(id);
    if (!log) {
      throw new Error(`VoteAuditLog with id ${id} not found`);
    }
    return log;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  // Additional save method for convenience
  async save(log: VoteAuditLog | Partial<VoteAuditLog>): Promise<VoteAuditLog> {
    return await this.repository.save(log);
  }
}
