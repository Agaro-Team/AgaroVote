import { IRepository } from '@shared/domain/repository.interface';
import { PollAddress } from '../entities/poll-address.entity';

export interface IPollAddressRepository extends IRepository<PollAddress> {
  findByPollId(pollId: string): Promise<PollAddress[]>;
  findByWalletAddress(walletAddress: string): Promise<PollAddress[]>;
  deleteByPollId(pollId: string): Promise<boolean>;
  createMany(addresses: Partial<PollAddress>[]): Promise<PollAddress[]>;
  isWalletAllowed(pollId: string, walletAddress: string): Promise<boolean>;
}

export const POLL_ADDRESS_REPOSITORY = Symbol('POLL_ADDRESS_REPOSITORY');
