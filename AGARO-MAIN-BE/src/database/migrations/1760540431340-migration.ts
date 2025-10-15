import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760540431340 implements MigrationInterface {
  name = 'Migration1760540431340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "polls" ADD "is_token_required" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "polls" ADD "reward_share" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "polls" DROP COLUMN "reward_share"`);
    await queryRunner.query(
      `ALTER TABLE "polls" DROP COLUMN "is_token_required"`,
    );
  }
}
