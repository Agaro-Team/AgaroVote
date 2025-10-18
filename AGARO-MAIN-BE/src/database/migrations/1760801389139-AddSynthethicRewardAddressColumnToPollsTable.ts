import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSynthethicRewardAddressColumnToPollsTable1760801389139
  implements MigrationInterface
{
  name = 'AddSynthethicRewardAddressColumnToPollsTable1760801389139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "polls" ADD "synthetic_reward_contract_address" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "polls" DROP COLUMN "synthetic_reward_contract_address"`,
    );
  }
}
