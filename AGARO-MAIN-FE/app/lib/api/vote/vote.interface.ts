export interface CastVoteRequest {
  pollId: string;
  choiceId: string;
  voterWalletAddress: string;
  transactionHash?: string;
  blockNumber?: number;
  signature?: string;
  voteWeight?: number;
}

export interface CastVoteResponse {
  id: string;
  pollId: string;
  choiceId: string;
  voterWalletAddress: string;
  voterHash: string;
  poolHash: string;
  transactionHash: string | null;
  blockNumber: number | null;
  signature: string | null;
  voteWeight: number;
  votedAt: string;
  createdAt: string;
  isOnChain: boolean;
  isVerified: boolean;
}
