import { IsNotEmpty, IsString } from 'class-validator';

export class ActivatePollDto {
  @IsNotEmpty()
  @IsString()
  public pollHash?: string;

  @IsString()
  @IsNotEmpty()
  public syntheticRewardContractAddress?: string;

  constructor(data: ActivatePollDto) {
    this.syntheticRewardContractAddress =
      data?.syntheticRewardContractAddress ?? '';
    this.pollHash = data?.pollHash ?? '';
  }
}
