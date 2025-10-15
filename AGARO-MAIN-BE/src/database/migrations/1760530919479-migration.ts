import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760530919479 implements MigrationInterface {
  name = 'Migration1760530919479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3de376cf1231965a35efdb45b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" RENAME COLUMN "pool_hash" TO "poll_hash"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_228a6f608fb83acc769caf3bcc" ON "votes" ("poll_hash") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_228a6f608fb83acc769caf3bcc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" RENAME COLUMN "poll_hash" TO "pool_hash"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3de376cf1231965a35efdb45b" ON "votes" ("pool_hash") `,
    );
  }
}
