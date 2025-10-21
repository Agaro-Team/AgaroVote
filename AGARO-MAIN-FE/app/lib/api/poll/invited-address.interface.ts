import type { ApiListResponse, ApiRequest, ApiResponse } from '../api.interface';

/**
 * Invited Address - represents a wallet address allowed to vote in a private poll
 */
export interface InvitedAddress {
  id: string;
  pollId: string;
  walletAddress: string;
}

/**
 * Sort options for invited addresses
 */
export enum InvitedAddressSortBy {
  CREATED_AT = 'createdAt',
  WALLET_ADDRESS = 'walletAddress',
}

/**
 * Get invited addresses request - query parameters
 */
export interface GetInvitedAddressesRequest extends ApiRequest {
  sortBy?: InvitedAddressSortBy;
  q?: string; // Search query for wallet address
}

/**
 * Get invited addresses response - paginated list
 */
export interface GetInvitedAddressesResponse extends ApiResponse<ApiListResponse<InvitedAddress>> {}
