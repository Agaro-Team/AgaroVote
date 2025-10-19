import { Reward } from '../../domain/entities/reward.entity';

type Address = `0x${string}`;

/**
 * Poll Contract Address DTO
 * Contains minimal information needed to interact with a poll's synthetic reward contract
 * Used for both claimable and pending rewards
 */
export class PollContractAddressDto {
  /** Voter's wallet address */
  public readonly voterWalletAddress: Address;

  /** Address of the SyntheticReward contract for this poll */
  public readonly syntheticRewardContractAddress: Address;

  constructor(address: Address, syntheticRewardContractAddress: Address) {
    this.voterWalletAddress = address;
    this.syntheticRewardContractAddress = syntheticRewardContractAddress;
  }

  /**
   * Create PollContractAddressDto from a Reward entity
   *
   * @param entity Reward entity with poll relation loaded
   * @returns PollContractAddressDto instance
   * @throws Error if poll or syntheticRewardContractAddress is missing
   */
  static fromEntity(entity: Reward): PollContractAddressDto {
    if (!entity.poll) {
      throw new Error(
        `Poll relation not loaded for reward ${entity.id}. Ensure poll is included in the query.`,
      );
    }

    if (!entity.poll.syntheticRewardContractAddress) {
      throw new Error(
        `Synthetic reward contract address not found for poll ${entity.pollId}`,
      );
    }

    return new PollContractAddressDto(
      entity.voterWalletAddress as Address,
      entity.poll.syntheticRewardContractAddress as Address,
    );
  }
}

// Alias for backward compatibility
export const ClaimableDashboardDto = PollContractAddressDto;
