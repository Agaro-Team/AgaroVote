import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760542505140 implements MigrationInterface {
  name = 'Migration1760542505140';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "votes" ADD "commit_token" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "votes" DROP COLUMN "commit_token"`);
  }
}
