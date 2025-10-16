import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760623021783 implements MigrationInterface {
  name = 'Migration1760623021783';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_AUTH_NONCES_WALLET_ADDRESS"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_AUTH_NONCES_WALLET_EXPIRES"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_AUTH_NONCES_NONCE"`);
    await queryRunner.query(
      `ALTER TABLE "auth_nonces" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_nonces" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_nonces" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b7e733a597a61dfff0e1d45790" ON "auth_nonces" ("wallet_address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9039385ea3ab8aa882bf8cf73" ON "auth_nonces" ("wallet_address", "expires_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a9039385ea3ab8aa882bf8cf73"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b7e733a597a61dfff0e1d45790"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_nonces" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_nonces" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_nonces" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AUTH_NONCES_NONCE" ON "auth_nonces" ("nonce") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AUTH_NONCES_WALLET_EXPIRES" ON "auth_nonces" ("wallet_address", "expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AUTH_NONCES_WALLET_ADDRESS" ON "auth_nonces" ("wallet_address") `,
    );
  }
}
