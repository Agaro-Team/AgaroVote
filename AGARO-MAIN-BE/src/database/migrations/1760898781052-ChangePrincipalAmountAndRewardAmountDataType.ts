import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePrincipalAmountAndRewardAmountDataType1760898781052
  implements MigrationInterface
{
  name = 'ChangePrincipalAmountAndRewardAmountDataType1760898781052';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP COLUMN "principal_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD "principal_amount" numeric(78,0) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP COLUMN "reward_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD "reward_amount" numeric(78,0) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP COLUMN "reward_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD "reward_amount" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP COLUMN "principal_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD "principal_amount" bigint NOT NULL DEFAULT '0'`,
    );
  }
}
