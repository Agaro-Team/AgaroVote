import { Vote } from '@modules/vote/domain/entities/vote.entity';

export class VoteResponseDto {
  id: string;
  pollId: string;
  choiceId: string;
  commitToken?: number;
  voterWalletAddress: string;
  voterHash: string;
  pollHash: string;
  transactionHash?: string;
  blockNumber?: number;
  signature?: string;
  voteWeight: number;
  votedAt: Date;
  createdAt: Date;
  isOnChain: boolean;
  isVerified: boolean;

  static fromEntity(vote: Vote): VoteResponseDto {
    const dto = new VoteResponseDto();
    dto.id = vote.id;
    dto.pollId = vote.pollId;
    dto.choiceId = vote.choiceId;
    dto.commitToken = vote.commitToken;
    dto.voterWalletAddress = vote.voterWalletAddress;
    dto.voterHash = vote.voterHash;
    dto.pollHash = vote.pollHash;
    dto.transactionHash = vote.transactionHash;
    dto.blockNumber = vote.blockNumber;
    dto.signature = vote.signature;
    dto.voteWeight = vote.voteWeight;
    dto.votedAt = vote.votedAt;
    dto.createdAt = vote.createdAt;
    dto.isOnChain = vote.isOnChain();
    dto.isVerified = vote.isVerified();
    return dto;
  }

  static fromEntities(votes: Vote[]): VoteResponseDto[] {
    return votes.map((vote) => this.fromEntity(vote));
  }
}
