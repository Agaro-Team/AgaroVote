import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler, EventBus } from '@nestjs/cqrs';
import {
  VoteCastedEvent,
  VoteStatsUpdatedEvent,
} from '@modules/vote/domain/events';
import {
  VOTE_STAT_REPOSITORY,
  type IVoteStatRepository,
} from '@modules/vote/domain/repositories/vote-stat-repository.interface';
import {
  VOTE_AUDIT_LOG_REPOSITORY,
  type IVoteAuditLogRepository,
} from '@modules/vote/domain/repositories/vote-audit-log-repository.interface';
import { VoteAuditLog } from '@modules/vote/domain/entities/vote-audit-log.entity';

/**
 * Event Handler for Vote Casted Event
 * Handles async vote statistics updates after a vote is casted
 */
@EventsHandler(VoteCastedEvent)
export class VoteCastedHandler implements IEventHandler<VoteCastedEvent> {
  private readonly logger = new Logger(VoteCastedHandler.name);

  constructor(
    @Inject(VOTE_STAT_REPOSITORY)
    private readonly voteStatRepository: IVoteStatRepository,
    @Inject(VOTE_AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IVoteAuditLogRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: VoteCastedEvent): Promise<void> {
    this.logger.log(
      `Handling vote casted event for poll ${event.pollId}, choice ${event.choiceId}`,
    );

    try {
      // Get current stat before update
      const currentStat = await this.voteStatRepository.findByPollAndChoice(
        event.pollId,
        event.choiceId,
      );

      const previousVoteCount = currentStat?.voteCount || 0;

      // Increment vote count with retry (handles optimistic locking)
      await this.voteStatRepository.incrementVoteCountWithRetry(
        event.pollId,
        event.choiceId,
        event.votedAt,
      );

      // Update percentages for all choices in the poll
      await this.voteStatRepository.updatePercentagesForPoll(event.pollId);

      // Get updated stat
      const updatedStat = await this.voteStatRepository.findByPollAndChoice(
        event.pollId,
        event.choiceId,
      );

      if (updatedStat) {
        // Log the stats update in audit trail
        const auditLog = VoteAuditLog.createStatsUpdated(
          updatedStat.id,
          'system',
          { voteCount: previousVoteCount },
          {
            voteCount: updatedStat.voteCount,
            votePercentage: updatedStat.votePercentage,
          },
        );
        await this.auditLogRepository.save(auditLog);

        // Emit stats updated event
        const totalVotes =
          await this.voteStatRepository.getTotalVoteCountForPoll(event.pollId);

        const statsUpdatedEvent = new VoteStatsUpdatedEvent(
          event.pollId,
          event.choiceId,
          previousVoteCount,
          updatedStat.voteCount,
          Number(updatedStat.votePercentage),
          totalVotes,
          new Date(),
        );

        this.eventBus.publish(statsUpdatedEvent);
      }

      this.logger.log(
        `Successfully updated vote stats for poll ${event.pollId}, choice ${event.choiceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update vote stats for poll ${event.pollId}`,
        error,
      );
      // In a production system, you might want to:
      // 1. Retry with exponential backoff
      // 2. Send to dead letter queue
      // 3. Alert monitoring system
      throw error;
    }
  }
}
