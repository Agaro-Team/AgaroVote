import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRewardClaimsTable1760881906979
  implements MigrationInterface
{
  name = 'RemoveRewardClaimsTable1760881906979';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "reward_claims" DROP CONSTRAINT "FK_24d38bed12b7b115c6cfc117cac"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "public"."IDX_24d38bed12b7b115c6cfc117ca"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b7790e9364fadcf7bb1cbae74e"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "reward_claims"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE "public"."reward_claims_status_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate enum type
    await queryRunner.query(
      `CREATE TYPE "public"."reward_claims_status_enum" AS ENUM('pending', 'claimed', 'failed')`,
    );

    // Recreate table
    await queryRunner.query(
      `CREATE TABLE "reward_claims" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "reward_id" uuid NOT NULL,
        "wallet_address" character varying NOT NULL,
        "claimed_at" TIMESTAMP NOT NULL,
        "status" "public"."reward_claims_status_enum" NOT NULL DEFAULT 'pending',
        CONSTRAINT "PK_f30d647df5942da2bf0371e2e62" PRIMARY KEY ("id")
      )`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_24d38bed12b7b115c6cfc117ca" ON "reward_claims" ("reward_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b7790e9364fadcf7bb1cbae74e" ON "reward_claims" ("reward_id", "wallet_address")`,
    );

    // Recreate foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "reward_claims" ADD CONSTRAINT "FK_24d38bed12b7b115c6cfc117cac" FOREIGN KEY ("reward_id") REFERENCES "vote_rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
