import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdjustBigIntColumnDataType1760898355695
  implements MigrationInterface
{
  name = 'AdjustBigIntColumnDataType1760898355695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP COLUMN "principal_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD "principal_amount" bigint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP COLUMN "reward_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD "reward_amount" bigint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP COLUMN "reward_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD "reward_amount" numeric(20,8) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP COLUMN "principal_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD "principal_amount" numeric(20,8) NOT NULL DEFAULT '0'`,
    );
  }
}
