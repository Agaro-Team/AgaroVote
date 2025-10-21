import { PollAddress } from '../../domain/entities/poll-address.entity';

export class InvitedAddressResponseDto {
  public readonly id: string;
  public readonly pollId: string;
  public readonly walletAddress: string;

  constructor(id: string, pollId: string, walletAddress: string) {
    this.id = id;
    this.pollId = pollId;
    this.walletAddress = walletAddress;
  }

  static fromEntity(entity: PollAddress): InvitedAddressResponseDto {
    return new InvitedAddressResponseDto(
      entity.id,
      entity.pollId,
      entity.walletAddress,
    );
  }

  static fromEntities(entities: PollAddress[]): InvitedAddressResponseDto[] {
    return entities.map((entity) =>
      InvitedAddressResponseDto.fromEntity(entity),
    );
  }
}
