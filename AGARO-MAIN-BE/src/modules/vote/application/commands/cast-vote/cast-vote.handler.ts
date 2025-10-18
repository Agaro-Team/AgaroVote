import { CreateVoteRewardsCommand } from '@/modules/reward/application/commands/create-vote-rewards.command';
import {
  CheckVotingEligibilityQuery,
  VotingEligibilityResult,
} from '@modules/poll/application/queries';
import { VoteAuditLog } from '@modules/vote/domain/entities/vote-audit-log.entity';
import { Vote } from '@modules/vote/domain/entities/vote.entity';
import {
  IllegalVoteAttemptedEvent,
  VoteCastedEvent,
} from '@modules/vote/domain/events';
import {
  VOTE_AUDIT_LOG_REPOSITORY,
  type IVoteAuditLogRepository,
} from '@modules/vote/domain/repositories/vote-audit-log-repository.interface';
import {
  VOTE_REPOSITORY,
  type IVoteRepository,
} from '@modules/vote/domain/repositories/vote-repository.interface';
import { PoolHash } from '@modules/vote/domain/value-objects/pool-hash.vo';
import { VoteSignature } from '@modules/vote/domain/value-objects/vote-signature.vo';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { CastVoteCommand } from './cast-vote.command';

@CommandHandler(CastVoteCommand)
export class CastVoteHandler implements ICommandHandler<CastVoteCommand> {
  private readonly logger = new Logger(CastVoteHandler.name);

  constructor(
    @Inject(VOTE_REPOSITORY)
    private readonly voteRepository: IVoteRepository,
    @Inject(VOTE_AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IVoteAuditLogRepository,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
    private readonly dataSource: DataSource,
  ) {}

  async execute(props: CastVoteCommand): Promise<Vote> {
    const command = props.props;
    // 1. Validate vote eligibility via QueryBus (no tight coupling with Poll module!)
    const eligibility = await this.queryBus.execute<
      CheckVotingEligibilityQuery,
      VotingEligibilityResult
    >(
      new CheckVotingEligibilityQuery(
        command.pollId,
        command.voterWalletAddress,
        command.choiceId,
      ),
    );

    if (!eligibility.eligible) {
      await this.logIllegalAttempt(
        command.pollId,
        command.voterWalletAddress,
        eligibility.reason!,
        command.ipAddress,
        command.userAgent,
      );

      if (eligibility.reason === 'Poll not found') {
        throw new BadRequestException(eligibility.reason);
      }
      throw new ForbiddenException(eligibility.reason);
    }

    const poll = eligibility.poll!;

    // 2. Check if already voted
    const hasVoted = await this.voteRepository.hasVoted(
      command.pollId,
      command.voterWalletAddress,
    );

    if (hasVoted) {
      await this.logIllegalAttempt(
        command.pollId,
        command.voterWalletAddress,
        'Already voted in this poll',
        command.ipAddress,
        command.userAgent,
      );
      throw new ForbiddenException('You have already voted in this poll');
    }

    const pollHash = PoolHash.fromPoll(poll.pollHash);
    const signature = command.signature
      ? VoteSignature.createOptional(command.signature)
      : null;

    // 4. Execute vote and reward creation in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create and save vote
      const vote = new Vote();
      vote.pollId = command.pollId;
      vote.choiceId = command.choiceId;
      vote.voterWalletAddress = command.voterWalletAddress;
      vote.pollHash = pollHash.value;
      vote.transactionHash = command.transactionHash;
      vote.blockNumber = command.blockNumber;
      vote.signature = signature?.value;
      vote.voteWeight = command.voteWeight || 1;
      vote.commitToken = command.commitToken;
      vote.votedAt = new Date();

      const savedVote = await queryRunner.manager.save(Vote, vote);

      // Log the vote in audit trail
      const auditLog = VoteAuditLog.createVoteCasted(
        savedVote.id,
        command.voterWalletAddress,
        {
          pollId: savedVote.pollId,
          choiceId: savedVote.choiceId,
          pollHash: savedVote.pollHash,
        },
        command.ipAddress,
        command.userAgent,
      );
      await queryRunner.manager.save(VoteAuditLog, auditLog);

      // Create vote rewards if poll supports rewards
      if (poll.isSupportRewards()) {
        await this.commandBus.execute<CreateVoteRewardsCommand, void>(
          new CreateVoteRewardsCommand(
            savedVote.id,
            savedVote.voterWalletAddress,
            savedVote.pollId,
            savedVote.commitToken || 0, // principalAmount is commitToken
            0, // rewardAmount is from poll.rewardShare keep 0 because the estimation real is when user withdraw/claim
            poll.endDate, // claimableAt is poll.endDate
          ),
        );
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // 5. Publish domain event (for async stats update) - AFTER transaction commits
      this.eventBus.publish(
        new VoteCastedEvent(
          savedVote.id,
          savedVote.pollId,
          savedVote.choiceId,
          savedVote.voterWalletAddress,
          savedVote.pollHash,
          savedVote.votedAt,
          savedVote.transactionHash,
          savedVote.blockNumber,
          savedVote.signature,
        ),
      );

      this.logger.log(
        `Vote cast successfully for pollId: ${savedVote.pollId}, voteId: ${savedVote.id}`,
      );

      return savedVote;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to cast vote for pollId: ${command.pollId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  private async logIllegalAttempt(
    pollId: string,
    voterWalletAddress: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog = VoteAuditLog.createIllegalAttempt(
      pollId,
      voterWalletAddress,
      reason,
      {},
      ipAddress,
      userAgent,
    );
    await this.auditLogRepository.save(auditLog);

    this.eventBus.publish(
      new IllegalVoteAttemptedEvent(
        pollId,
        voterWalletAddress,
        reason,
        new Date(),
        {},
        ipAddress,
        userAgent,
      ),
    );
  }
}
