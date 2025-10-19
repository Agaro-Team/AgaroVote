import type { ApiListResponse, ApiResponse } from '../api.interface';

export interface CastVoteRequest {
  pollId: string;
  choiceId: string;
  commitToken?: number;
  voterWalletAddress: string;
  transactionHash?: string;
  blockNumber?: number;
  signature?: string;
  voteWeight?: number;
}

export interface CastVoteResponse
  extends ApiResponse<{
    id: string;
    pollId: string;
    choiceId: string;
    voterWalletAddress: string;
    voterHash: string;
    pollHash: string;
    transactionHash: string | null;
    blockNumber: number | null;
    signature: string | null;
    voteWeight: number;
    votedAt: string;
    createdAt: string;
    isOnChain: boolean;
    isVerified: boolean;
  }> {}

/**
 * Get user vote for a specific poll
 */
export interface GetUserVoteRequest {
  pollId: string;
  voterWalletAddress: string;
}

export interface GetUserVote {
  id: string;
  pollId: string;
  choiceId: string;
  choiceName: string;
  commitToken: number | null;
  voterWalletAddress: string;
  voterHash: string;
  pollHash: string;
  transactionHash: string | null;
  blockNumber: number | null;
  signature: string | null;
  voteWeight: number;
  votedAt: string;
  createdAt: string;
  isOnChain: boolean;
  isVerified: boolean;
}

export interface GetUserVoteResponse extends ApiResponse<GetUserVote> {}

/**
 * Check if user has voted
 */
export interface CheckHasVotedRequest {
  pollId: string;
  voterWalletAddress: string;
}

export interface CheckHasVotedResponse extends ApiResponse<{ hasVoted: boolean }> {}

export interface GetUserVotesRequest {
  pollId?: string;
  voterWalletAddress?: string;
  pollHash?: string;
  page?: number;
  limit?: number;
}

export interface GetUserVotesResponse extends ApiResponse<ApiListResponse<GetUserVote>> {}
