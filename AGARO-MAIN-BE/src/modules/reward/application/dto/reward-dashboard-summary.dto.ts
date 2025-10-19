import { ethers } from 'ethers';
import { Reward } from '../../domain/entities/reward.entity';
import { PollContractAddressDto } from './claimable-dashboard.dto';

/**
 * Interface for Reward Dashboard Summary
 * Aggregates reward statistics for a user's dashboard
 */
export interface RewardDashboardSummary {
  /** Total amount of rewards that have been claimed (in wei or smallest unit) */
  totalClaimedAmount: number;

  /** Total amount of rewards that have been claimed (in ethers) */
  totalClaimedAmountEthers: string;

  /** Total number of unique polls from which rewards have been claimed */
  totalClaimedFromPolls: number;

  /** Total number of unique polls with pending rewards (not yet claimable) */
  totalPendingFromPolls: number;

  /** Total number of unique polls with claimable rewards (ready to claim) */
  totalClaimableFromPolls: number;

  /** Total amount available to claim from all claimable rewards */
  totalClaimableAmount: number;

  /** Total amount in pending rewards (not yet claimable) */
  totalPendingAmount: number;
}

/**
 * Response DTO for Reward Dashboard Summary
 * Provides aggregated statistics about a user's rewards across all polls
 * All calculations are done in the application layer (DTO), not in the repository
 */
export class RewardDashboardSummaryResponseDto
  implements RewardDashboardSummary
{
  public readonly totalClaimedAmount: number;
  public readonly totalClaimedFromPolls: number;
  public readonly totalPendingFromPolls: number;
  public readonly totalClaimableFromPolls: number;
  public readonly totalClaimableAmount: number;
  public readonly totalPendingAmount: number;

  public readonly totalClaimedAmountEthers: string;

  public readonly syntheticClaimedPlucks: `0x${string}`[];
  public readonly syntheticPendingPlucks: `0x${string}`[];
  public readonly syntheticClaimablePlucks: `0x${string}`[];
  public readonly allSyntheticRewardContractAddresses: `0x${string}`[];

  constructor(
    totalClaimedAmount: number,
    totalClaimedFromPolls: number,
    totalPendingFromPolls: number,
    totalClaimableFromPolls: number,
    totalClaimableAmount: number,
    totalPendingAmount: number,
    totalClaimedAmountEthers: string,
    claimable: PollContractAddressDto[],
    pending: PollContractAddressDto[],
    claimed: PollContractAddressDto[],
    allSyntheticRewardContractAddresses: `0x${string}`[],
  ) {
    this.totalClaimedAmount = totalClaimedAmount;
    this.totalClaimedFromPolls = totalClaimedFromPolls;
    this.totalPendingFromPolls = totalPendingFromPolls;
    this.totalClaimableFromPolls = totalClaimableFromPolls;
    this.totalClaimableAmount = totalClaimableAmount;
    this.totalPendingAmount = totalPendingAmount;
    this.totalClaimedAmountEthers = totalClaimedAmountEthers;
    this.allSyntheticRewardContractAddresses =
      allSyntheticRewardContractAddresses;

    this.syntheticClaimablePlucks = claimable.map(
      (c) => c.syntheticRewardContractAddress,
    );
    this.syntheticPendingPlucks = pending.map(
      (p) => p.syntheticRewardContractAddress,
    );
    this.syntheticClaimedPlucks = claimed.map(
      (c) => c.syntheticRewardContractAddress,
    );
  }

  /**
   * Create a dashboard summary from an array of reward entities
   * All aggregation and calculation logic happens here in the application layer
   *
   * @param rewards Array of reward entities (raw list from repository)
   * @returns RewardDashboardSummaryResponseDto with aggregated statistics
   */
  static fromEntities(rewards: Reward[]): RewardDashboardSummaryResponseDto {
    // ========== FILTER REWARDS BY STATUS ==========
    const claimedRewards = rewards.filter((r) => r.isClaimed());
    const claimableRewards = rewards.filter(
      (r) => !r.isClaimed() && r.isClaimable(),
    );
    const pendingRewards = rewards.filter(
      (r) => !r.isClaimed() && !r.isClaimable(),
    );

    // ========== CALCULATE AMOUNTS ==========
    const totalClaimedAmount = claimedRewards.reduce(
      (sum, r) => sum + Number(r.rewardAmount),
      0,
    );

    const totalClaimableAmount = claimableRewards.reduce(
      (sum, r) => sum + Number(r.rewardAmount),
      0,
    );

    const totalPendingAmount = pendingRewards.reduce(
      (sum, r) => sum + Number(r.rewardAmount),
      0,
    );

    // ========== GET UNIQUE POLL COUNTS ==========
    const claimedPollIds = new Set(claimedRewards.map((r) => r.pollId));
    const claimablePollIds = new Set(claimableRewards.map((r) => r.pollId));
    const pendingPollIds = new Set(pendingRewards.map((r) => r.pollId));

    // ========== GET UNIQUE POLL CONTRACT ADDRESSES ==========
    // For claimable - group by pollId to get unique poll contracts
    const claimableMap = new Map<string, Reward>();
    claimableRewards
      .filter((r) => r.poll?.syntheticRewardContractAddress)
      .forEach((reward) => {
        if (!claimableMap.has(reward.pollId)) {
          claimableMap.set(reward.pollId, reward);
        }
      });

    // For pending - group by pollId to get unique poll contracts
    const pendingMap = new Map<string, Reward>();
    pendingRewards
      .filter((r) => r.poll?.syntheticRewardContractAddress)
      .forEach((reward) => {
        if (!pendingMap.has(reward.pollId)) {
          pendingMap.set(reward.pollId, reward);
        }
      });

    // For claimed - group by pollId to get unique poll contracts
    const claimedMap = new Map<string, Reward>();
    claimedRewards
      .filter((r) => r.poll?.syntheticRewardContractAddress)
      .forEach((reward) => {
        if (!claimedMap.has(reward.pollId)) {
          claimedMap.set(reward.pollId, reward);
        }
      });

    // Convert to DTOs (only address & syntheticRewardContractAddress)
    const claimable = Array.from(claimableMap.values()).map((reward) =>
      PollContractAddressDto.fromEntity(reward),
    );

    const pending = Array.from(pendingMap.values()).map((reward) =>
      PollContractAddressDto.fromEntity(reward),
    );

    const claimed = Array.from(claimedMap.values()).map((reward) =>
      PollContractAddressDto.fromEntity(reward),
    );

    const totalClaimedAmountEthers = ethers.formatEther(
      BigInt(totalClaimedAmount),
    );

    const uniqueSyntheticRewardContractAddresses = new Set(
      [...claimable, ...pending, ...claimed].map(
        (c) => c.syntheticRewardContractAddress,
      ),
    );

    const allSyntheticRewardContractAddresses = Array.from(
      uniqueSyntheticRewardContractAddresses,
    );

    return new RewardDashboardSummaryResponseDto(
      totalClaimedAmount,
      claimedPollIds.size,
      pendingPollIds.size,
      claimablePollIds.size,
      totalClaimableAmount,
      totalPendingAmount,
      totalClaimedAmountEthers,
      claimable,
      pending,
      claimed,
      allSyntheticRewardContractAddresses,
    );
  }

  /**
   * Create an empty dashboard summary
   * Useful for users with no rewards yet
   *
   * @returns Empty RewardDashboardSummaryResponseDto with zero values
   */
  static empty(): RewardDashboardSummaryResponseDto {
    return new RewardDashboardSummaryResponseDto(
      0,
      0,
      0,
      0,
      0,
      0,
      '0',
      [],
      [],
      [],
      [],
    );
  }
}
