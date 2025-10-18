import { CastVoteCommand } from '@modules/vote/application/commands';
import { CastVoteDto } from '@modules/vote/application/dto/cast-vote.dto';
import { GetAuditLogsQueryDto } from '@modules/vote/application/dto/get-audit-logs-query.dto';
import { GetVotesQueryDto } from '@modules/vote/application/dto/get-votes-query.dto';
import { VoteAuditLogResponseDto } from '@modules/vote/application/dto/vote-audit-log-response.dto';
import { VoteResponseDto } from '@modules/vote/application/dto/vote-response.dto';
import { PollVoteStatsResponseDto } from '@modules/vote/application/dto/vote-stats-response.dto';
import {
  CheckHasVotedQuery,
  GetAuditLogsQuery,
  GetVoteByVoterQuery,
  GetVoteStatsQuery,
  GetVotesByPollQuery,
  GetVotesPaginatedQuery,
  PaginatedAuditLogsResult,
  PaginatedVotesResult,
} from '@modules/vote/application/queries';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { Vote } from '../../domain/entities/vote.entity';
import { VoteStat } from '../../domain/entities/vote-stat.entity';
import {
  AuditAction,
  EntityType,
} from '../../domain/entities/vote-audit-log.entity';
import { Public } from '@modules/auth/presentation/decorators/public.decorator';
import { Wallet } from '@modules/auth/presentation/decorators/wallet.decorator';

@Controller('votes')
@UseInterceptors(ClassSerializerInterceptor)
export class VoteController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Cast a vote
   * POST /votes
   * Requires authentication - wallet must match the voter wallet address
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async castVote(
    @Wallet() walletAddress: string,
    @Body() dto: CastVoteDto,
    @Req() request: Request,
  ): Promise<VoteResponseDto> {
    // Verify the voter wallet matches the authenticated wallet
    if (dto.voterWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new ForbiddenException(
        'You can only vote with your own wallet address',
      );
    }

    const ipAddress = this.getClientIp(request);
    const userAgent = request.get('user-agent');

    const vote = await this.commandBus.execute<CastVoteCommand, Vote>(
      new CastVoteCommand({
        pollId: dto.pollId,
        choiceId: dto.choiceId,
        voterWalletAddress: dto.voterWalletAddress,
        transactionHash: dto.transactionHash,
        blockNumber: dto.blockNumber,
        signature: dto.signature,
        voteWeight: dto.voteWeight,
        commitToken: dto.commitToken,
        ipAddress: ipAddress,
        userAgent: userAgent,
      }),
    );

    return VoteResponseDto.fromEntity(vote);
  }

  /**
   * Get vote statistics for a poll
   * GET /votes/stats/:pollId
   * Public endpoint - anyone can view stats
   */
  @Public()
  @Get('stats/:pollId')
  async getVoteStats(
    @Param('pollId') pollId: string,
  ): Promise<PollVoteStatsResponseDto> {
    const stats = await this.queryBus.execute<GetVoteStatsQuery, VoteStat[]>(
      new GetVoteStatsQuery(pollId),
    );
    return PollVoteStatsResponseDto.create(pollId, stats);
  }

  /**
   * Get all votes with pagination and filters
   * GET /votes
   * Public endpoint - anyone can view votes
   */
  @Public()
  @Get()
  async getVotes(@Query() query: GetVotesQueryDto) {
    const filters: {
      pollId?: string;
      voterWalletAddress?: string;
      pollHash?: string;
    } = {};
    if (query.pollId) filters.pollId = query.pollId;
    if (query.voterWalletAddress)
      filters.voterWalletAddress = query.voterWalletAddress;
    if (query.pollHash) filters.pollHash = query.pollHash;

    const result = await this.queryBus.execute<
      GetVotesPaginatedQuery,
      PaginatedVotesResult
    >(new GetVotesPaginatedQuery(query.page || 1, query.limit || 10, filters));

    return {
      data: VoteResponseDto.fromEntities(result.votes),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Get votes by poll
   * GET /votes/poll/:pollId
   * Public endpoint - anyone can view votes
   */
  @Public()
  @Get('poll/:pollId')
  async getVotesByPoll(
    @Param('pollId') pollId: string,
  ): Promise<VoteResponseDto[]> {
    const votes = await this.queryBus.execute<GetVotesByPollQuery, Vote[]>(
      new GetVotesByPollQuery(pollId),
    );
    return VoteResponseDto.fromEntities(votes);
  }

  /**
   * Get vote by voter and poll
   * GET /votes/poll/:pollId/voter/:voterWalletAddress
   * Public endpoint - anyone can view votes
   */
  @Public()
  @Get('poll/:pollId/voter/:voterWalletAddress')
  async getVoteByVoter(
    @Param('pollId') pollId: string,
    @Param('voterWalletAddress') voterWalletAddress: string,
  ): Promise<VoteResponseDto> {
    const vote = await this.queryBus.execute<GetVoteByVoterQuery, Vote>(
      new GetVoteByVoterQuery(pollId, voterWalletAddress),
    );
    return VoteResponseDto.fromEntity(vote);
  }

  /**
   * Check if a voter has voted in a poll
   * GET /votes/poll/:pollId/voter/:voterWalletAddress/has-voted
   * Public endpoint - anyone can check voting status
   */
  @Public()
  @Get('poll/:pollId/voter/:voterWalletAddress/has-voted')
  async checkHasVoted(
    @Param('pollId') pollId: string,
    @Param('voterWalletAddress') voterWalletAddress: string,
  ): Promise<{ hasVoted: boolean }> {
    const hasVoted = await this.queryBus.execute<CheckHasVotedQuery, boolean>(
      new CheckHasVotedQuery(pollId, voterWalletAddress),
    );
    return { hasVoted };
  }

  /**
   * Get audit logs with pagination and filters
   * GET /votes/audit-logs
   * Public endpoint - transparency is key for voting
   */
  @Public()
  @Get('audit-logs')
  async getAuditLogs(@Query() query: GetAuditLogsQueryDto) {
    const filters: {
      action?: string;
      entityType?: string;
      performedBy?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};
    if (query.action) filters.action = query.action;
    if (query.entityType) filters.entityType = query.entityType;
    if (query.performedBy) filters.performedBy = query.performedBy;
    if (query.startDate) filters.startDate = new Date(query.startDate);
    if (query.endDate) filters.endDate = new Date(query.endDate);

    const result = await this.queryBus.execute<
      GetAuditLogsQuery,
      PaginatedAuditLogsResult
    >(
      new GetAuditLogsQuery(query.page || 1, query.limit || 10, {
        action: filters.action as AuditAction,
        entityType: filters.entityType as EntityType,
        performedBy: filters.performedBy,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }),
    );

    return {
      data: VoteAuditLogResponseDto.fromEntities(result.logs),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Helper method to extract client IP address
   */
  private getClientIp(request: Request): string | undefined {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress
    );
  }
}
