import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760529513556 implements MigrationInterface {
  name = 'Migration1760529513556';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "polls" RENAME COLUMN "pool_hash" TO "poll_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "polls" RENAME CONSTRAINT "UQ_7cf8befc8d1df828fd1091870ed" TO "UQ_ab9208754c815a84640cd7f376d"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "polls" RENAME CONSTRAINT "UQ_ab9208754c815a84640cd7f376d" TO "UQ_7cf8befc8d1df828fd1091870ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "polls" RENAME COLUMN "poll_hash" TO "pool_hash"`,
    );
  }
}
