import { IsString } from 'class-validator';

export class UpdateVoterHashDto {
  @IsString()
  voterHash: string;
}
