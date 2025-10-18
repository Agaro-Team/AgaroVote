import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REWARD_REPOSITORY } from './domain/repositories/reward-repository.interface';
import { TypeORMRewardRepository } from './infrastructure/repositories/typeorm-reward.repository';
import { RewardController } from './presentation/controllers/reward.controller';
import { Reward } from './domain/entities/reward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reward])],
  controllers: [RewardController],
  providers: [
    {
      provide: REWARD_REPOSITORY,
      useClass: TypeORMRewardRepository,
    },
  ],
  exports: [REWARD_REPOSITORY],
})
export class RewardModule {}
