import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class ActivatePollDto {
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  public syntheticRewardContractAddress: string;

  constructor(data: ActivatePollDto) {
    this.syntheticRewardContractAddress = data.syntheticRewardContractAddress;
  }
}
