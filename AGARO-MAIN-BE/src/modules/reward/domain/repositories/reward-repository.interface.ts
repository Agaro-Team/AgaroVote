import { IRepository } from '../../../../shared/domain/repository.interface';
import { Reward } from '../entities/reward.entity';

export interface IRewardRepository extends IRepository<Reward> {
  /**
   * Find reward by vote ID
   */
  findByVoteId(voteId: string): Promise<Reward | null>;

  /**
   * Find all rewards for a specific poll
   */
  findByPollId(pollId: string): Promise<Reward[]>;

  /**
   * Find all rewards for a specific voter
   */
  findByVoterWalletAddress(walletAddress: string): Promise<Reward[]>;

  /**
   * Check if a reward already exists for a vote
   */
  existsByVoteId(voteId: string): Promise<boolean>;

  /**
   * Get rewards with pagination and filters
   */
  findWithPagination(
    page: number,
    limit: number,
    filters?: {
      pollId?: string;
      voterWalletAddress?: string;
      claimableOnly?: boolean;
    },
  ): Promise<{ rewards: Reward[]; total: number }>;

  /**
   * Find reward by poll hash and voter wallet address
   */
  findByPollHashAndVoterWallet(
    pollHash: string,
    voterWalletAddress: string,
  ): Promise<Reward | null>;

  /**
   * Update reward by poll hash and voter wallet address
   */
  updateByPollHashAndVoterWallet(
    pollHash: string,
    voterWalletAddress: string,
    entity: Partial<Reward>,
  ): Promise<Reward | null>;
}

export const REWARD_REPOSITORY = Symbol('REWARD_REPOSITORY');
