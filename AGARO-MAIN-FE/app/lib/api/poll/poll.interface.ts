import type { ApiListResponse, ApiRequest, ApiResponse } from '../api.interface';

/**
 * Poll sort options matching backend enum
 */
export enum PollSortBy {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
}

/**
 * Choice interface - represents a voting option in a poll
 */
export interface Choice {
  id: string;
  pollId: string;
  choiceText: string;
  createdAt: string;
}

/**
 * Address interface - represents allowed wallet addresses for private polls
 */
export interface Address {
  id?: string;
  pollId?: string;
  walletAddress: string;
  createdAt?: string;
}

/**
 * Transaction status enum
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

/**
 * Poll interface - represents a complete voting pool with all its properties
 */
export interface Poll {
  id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  startDate: string;
  endDate: string;
  creatorWalletAddress: string;
  poolHash: `0x${string}`;
  transactionStatus: TransactionStatus;
  isActive: boolean;
  choices: Choice[];
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
  // Computed properties
  isOngoing: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
}

/**
 * Create poll request - used when creating a new poll
 */
export type CreatePollRequest = {
  title: string;
  description: string;
  choices: Omit<Choice, 'id' | 'pollId' | 'createdAt'>[];
  startDate: Date;
  endDate: Date;
  isPrivate: boolean;
  poolHash: string;
  addresses?: Omit<Address, 'id' | 'pollId' | 'createdAt'>[];
  creatorWalletAddress: string;
};

/**
 * Get polls request - query parameters for fetching polls
 */
export interface GetPollsRequest extends ApiRequest {
  sortBy?: PollSortBy;
  isPrivate?: boolean;
  isActive?: boolean;
  transactionStatus?: TransactionStatus;
  creatorWalletAddress?: string;
}

/**
 * Get polls response - paginated list of polls
 */
export interface GetPollsResponse extends ApiResponse<ApiListResponse<Poll>> {}

/**
 * Get single poll response
 */
export interface GetPollResponse {
  data: Poll;
}
