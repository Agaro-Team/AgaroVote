import {
  Poll,
  TransactionStatus,
} from '@modules/poll/domain/entities/poll.entity';

export class PollChoiceResponseDto {
  id: string;
  pollId: string;
  choiceText: string;
  createdAt: Date;
}

export class PollAddressResponseDto {
  id: string;
  pollId: string;
  walletAddress: string;
  createdAt: Date;
}

export class PollResponseDto {
  id: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  startDate: Date;
  endDate: Date;
  creatorWalletAddress: string;
  pollHash: string;
  voteCount: number;
  transactionStatus: TransactionStatus;
  isActive: boolean;
  rewardShare: number;
  isTokenRequired: boolean;
  choices?: PollChoiceResponseDto[];
  addresses?: PollAddressResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  // Computed properties
  isOngoing?: boolean;
  hasStarted?: boolean;
  hasEnded?: boolean;

  static fromEntity(
    poll: Poll | (Poll & { voteCount?: number }),
    includeRelations = false,
  ): PollResponseDto {
    const response = new PollResponseDto();
    response.id = poll.id;
    response.title = poll.title;
    response.description = poll.description;
    response.isPrivate = poll.isPrivate;
    response.rewardShare = poll.rewardShare;
    response.isTokenRequired = poll.isTokenRequired;
    response.startDate = poll.startDate;
    response.endDate = poll.endDate;
    response.creatorWalletAddress = poll.creatorWalletAddress;
    response.pollHash = poll.pollHash;
    response.rewardShare = poll.rewardShare;
    response.isTokenRequired = poll.isTokenRequired;

    // Extract voteCount from entity if available (from JOIN query), default to 0
    response.voteCount = 'voteCount' in poll ? (poll.voteCount ?? 0) : 0;

    response.transactionStatus = poll.transactionStatus;
    response.isActive = poll.isActive;
    response.createdAt = poll.createdAt;
    response.updatedAt = poll.updatedAt;

    // Computed properties
    response.isOngoing = poll.isOngoing();
    response.hasStarted = poll.hasStarted();
    response.hasEnded = poll.hasEnded();

    if (includeRelations) {
      response.choices = poll.choices?.map((choice) => ({
        id: choice.id,
        pollId: choice.pollId,
        choiceText: choice.choiceText,
        createdAt: choice.createdAt,
      }));

      response.addresses = poll.addresses?.map((address) => ({
        id: address.id,
        pollId: address.pollId,
        walletAddress: address.walletAddress,
        createdAt: address.createdAt,
      }));
    }

    return response;
  }
}
