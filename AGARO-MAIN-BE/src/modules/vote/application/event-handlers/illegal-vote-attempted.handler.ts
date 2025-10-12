import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IllegalVoteAttemptedEvent } from '@modules/vote/domain/events';

/**
 * Event Handler for Illegal Vote Attempted Event
 * Handles security monitoring and alerts when illegal votes are attempted
 */
@EventsHandler(IllegalVoteAttemptedEvent)
export class IllegalVoteAttemptedHandler
  implements IEventHandler<IllegalVoteAttemptedEvent>
{
  private readonly logger = new Logger(IllegalVoteAttemptedHandler.name);

  async handle(event: IllegalVoteAttemptedEvent): Promise<void> {
    const severity = event.getSeverity();

    this.logger.warn(
      `Illegal vote attempt detected [${severity.toUpperCase()}]: ` +
        `Poll ${event.pollId}, Voter ${event.voterWalletAddress}, ` +
        `Reason: ${event.reason}`,
    );

    // Log detailed info for high severity attempts
    if (severity === 'high') {
      this.logger.error('HIGH SEVERITY: Potential fraud attempt detected', {
        pollId: event.pollId,
        voterWalletAddress: event.voterWalletAddress,
        reason: event.reason,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata,
      });

      // In production, you might want to:
      // 1. Send alert to security team
      // 2. Trigger rate limiting for this wallet
      // 3. Update fraud detection system
      // 4. Send notification to poll creator
    }

    // Log duplicate vote attempts (might indicate bot activity)
    if (event.isDuplicateVoteAttempt()) {
      this.logger.warn(
        `Duplicate vote attempt from ${event.voterWalletAddress} for poll ${event.pollId}`,
      );

      // In production, you might want to:
      // 1. Increment counter for this wallet
      // 2. If counter exceeds threshold, temporarily ban wallet
      // 3. Send notification to poll creator
    }
  }
}
