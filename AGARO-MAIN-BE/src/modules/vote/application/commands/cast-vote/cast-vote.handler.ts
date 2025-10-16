import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  QueryBus,
} from '@nestjs/cqrs';
import {
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CastVoteCommand } from './cast-vote.command';
import {
  VOTE_REPOSITORY,
  type IVoteRepository,
} from '@modules/vote/domain/repositories/vote-repository.interface';
import {
  VOTE_AUDIT_LOG_REPOSITORY,
  type IVoteAuditLogRepository,
} from '@modules/vote/domain/repositories/vote-audit-log-repository.interface';
import {
  CheckVotingEligibilityQuery,
  VotingEligibilityResult,
} from '@modules/poll/application/queries';
import { Vote } from '@modules/vote/domain/entities/vote.entity';
import { VoterHash } from '@modules/vote/domain/value-objects/voter-hash.vo';
import { VoteSignature } from '@modules/vote/domain/value-objects/vote-signature.vo';
import { PoolHash } from '@modules/vote/domain/value-objects/pool-hash.vo';
import {
  VoteCastedEvent,
  IllegalVoteAttemptedEvent,
} from '@modules/vote/domain/events';
import { VoteAuditLog } from '@modules/vote/domain/entities/vote-audit-log.entity';

@CommandHandler(CastVoteCommand)
export class CastVoteHandler implements ICommandHandler<CastVoteCommand> {
  constructor(
    @Inject(VOTE_REPOSITORY)
    private readonly voteRepository: IVoteRepository,
    @Inject(VOTE_AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IVoteAuditLogRepository,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CastVoteCommand): Promise<Vote> {
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

    // 3. Create value objects
    const voterHash = VoterHash.create(
      command.pollId,
      command.voterWalletAddress,
    );
    const pollHash = PoolHash.fromPoll(poll.pollHash);
    const signature = command.signature
      ? VoteSignature.createOptional(command.signature)
      : null;

    // 4. Create and save vote
    const vote = new Vote();
    vote.pollId = command.pollId;
    vote.choiceId = command.choiceId;
    vote.voterWalletAddress = command.voterWalletAddress;
    vote.voterHash = voterHash.value;
    vote.pollHash = pollHash.value;
    vote.transactionHash = command.transactionHash;
    vote.blockNumber = command.blockNumber;
    vote.signature = signature?.value;
    vote.voteWeight = command.voteWeight || 1;
    vote.commitToken = command.commitToken;
    vote.votedAt = new Date();

    const savedVote = await this.voteRepository.save(vote);

    // 5. Log the vote in audit trail
    const auditLog = VoteAuditLog.createVoteCasted(
      savedVote.id,
      command.voterWalletAddress,
      {
        pollId: savedVote.pollId,
        choiceId: savedVote.choiceId,
        voterHash: savedVote.voterHash,
        pollHash: savedVote.pollHash,
      },
      command.ipAddress,
      command.userAgent,
    );
    await this.auditLogRepository.save(auditLog);

    // 6. Publish domain event (for async stats update)
    this.eventBus.publish(
      new VoteCastedEvent(
        savedVote.id,
        savedVote.pollId,
        savedVote.choiceId,
        savedVote.voterWalletAddress,
        savedVote.voterHash,
        savedVote.pollHash,
        savedVote.votedAt,
        savedVote.transactionHash,
        savedVote.blockNumber,
        savedVote.signature,
      ),
    );

    return savedVote;
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
