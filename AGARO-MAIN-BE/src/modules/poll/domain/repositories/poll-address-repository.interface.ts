import { IRepository } from '@shared/domain/repository.interface';
import { IPaginatedResult } from '@shared/application/dto/pagination.dto';
import { PollAddress } from '../entities/poll-address.entity';
import { InvitedAddressFilterDto } from '../../application/dto/invited-address-filter.dto';

export interface IPollAddressRepository extends IRepository<PollAddress> {
  findByPollId(pollId: string): Promise<PollAddress[]>;
  findByPollIdPaginated(
    pollId: string,
    filters: InvitedAddressFilterDto,
  ): Promise<IPaginatedResult<PollAddress>>;
  findByWalletAddress(walletAddress: string): Promise<PollAddress[]>;
  deleteByPollId(pollId: string): Promise<boolean>;
  createMany(addresses: Partial<PollAddress>[]): Promise<PollAddress[]>;
  isWalletAllowed(pollId: string, walletAddress: string): Promise<boolean>;
}

export const POLL_ADDRESS_REPOSITORY = Symbol('POLL_ADDRESS_REPOSITORY');
