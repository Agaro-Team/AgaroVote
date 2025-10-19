import { IsNotEmpty, IsString } from 'class-validator';
import { IsWeiAmount } from '@shared/validators/is-bigint.validator';

/**
 * DTO for claiming rewards from a poll
 * Used when a user wants to claim their earned rewards from the smart contract
 */
export class ClaimRewardDto {
  /**
   * Hash of the poll from which to claim rewards
   * @example "0x1234567890abcdef..."
   */
  @IsString()
  @IsNotEmpty()
  pollHash: string;

  /**
   * Wallet address of the voter claiming the reward
   * @example "0xabcdef1234567890..."
   */
  @IsString()
  @IsNotEmpty()
  voterWalletAddress: string;

  /**
   * Principal amount staked (in wei)
   * Must be a valid uint256 value as string
   * @example "1000000000000000000" // 1 ETH in wei
   */
  @IsWeiAmount({ message: 'Principal amount must be a valid wei amount' })
  @IsNotEmpty()
  principalAmount: string;

  /**
   * Reward amount earned (in wei)
   * Must be a valid uint256 value as string
   * @example "500000000000000000" // 0.5 ETH in wei
   */
  @IsWeiAmount({ message: 'Reward amount must be a valid wei amount' })
  @IsNotEmpty()
  rewardAmount: string;
}
