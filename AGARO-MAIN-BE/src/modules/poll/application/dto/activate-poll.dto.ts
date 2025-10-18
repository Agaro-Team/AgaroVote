import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class ActivatePollDto {
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  public pollHash?: string;

  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  public syntheticRewardContractAddress?: string;

  constructor(data: ActivatePollDto) {
    this.syntheticRewardContractAddress =
      data?.syntheticRewardContractAddress ?? '';
    this.pollHash = data?.pollHash ?? '';
  }
}
