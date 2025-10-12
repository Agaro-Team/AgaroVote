import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

// Entities
import { Vote } from './domain/entities/vote.entity';
import { VoteStat } from './domain/entities/vote-stat.entity';
import { VoteAuditLog } from './domain/entities/vote-audit-log.entity';

// Repository Interfaces
import { VOTE_REPOSITORY } from './domain/repositories/vote-repository.interface';
import { VOTE_STAT_REPOSITORY } from './domain/repositories/vote-stat-repository.interface';
import { VOTE_AUDIT_LOG_REPOSITORY } from './domain/repositories/vote-audit-log-repository.interface';

// Repository Implementations
import { TypeORMVoteRepository } from './infrastructure/repositories/typeorm-vote.repository';
import { TypeORMVoteStatRepository } from './infrastructure/repositories/typeorm-vote-stat.repository';
import { TypeORMVoteAuditLogRepository } from './infrastructure/repositories/typeorm-vote-audit-log.repository';

// Commands
import { CastVoteHandler } from './application/commands';

// Queries
import {
  GetVoteStatsHandler,
  GetVotesByPollHandler,
  GetVoteByVoterHandler,
  GetVotesPaginatedHandler,
  CheckHasVotedHandler,
  GetAuditLogsHandler,
} from './application/queries';

// Event Handlers
import { VoteCastedHandler } from './application/event-handlers/vote-casted.handler';
import { IllegalVoteAttemptedHandler } from './application/event-handlers/illegal-vote-attempted.handler';

// Controllers
import { VoteController } from './presentation/controllers/vote.controller';

// Import Poll Module (no direct coupling - only for CQRS queries)
import { PollModule } from '@modules/poll/poll.module';

const CommandHandlers = [CastVoteHandler];

const QueryHandlers = [
  GetVoteStatsHandler,
  GetVotesByPollHandler,
  GetVoteByVoterHandler,
  GetVotesPaginatedHandler,
  CheckHasVotedHandler,
  GetAuditLogsHandler,
];

const EventHandlers = [VoteCastedHandler, IllegalVoteAttemptedHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, VoteStat, VoteAuditLog]),
    CqrsModule,
    PollModule, // Import Poll module for CQRS queries (loose coupling!)
  ],
  controllers: [VoteController],
  providers: [
    // Repository Providers
    {
      provide: VOTE_REPOSITORY,
      useClass: TypeORMVoteRepository,
    },
    {
      provide: VOTE_STAT_REPOSITORY,
      useClass: TypeORMVoteStatRepository,
    },
    {
      provide: VOTE_AUDIT_LOG_REPOSITORY,
      useClass: TypeORMVoteAuditLogRepository,
    },

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [VOTE_REPOSITORY, VOTE_STAT_REPOSITORY, VOTE_AUDIT_LOG_REPOSITORY],
})
export class VoteModule {}
