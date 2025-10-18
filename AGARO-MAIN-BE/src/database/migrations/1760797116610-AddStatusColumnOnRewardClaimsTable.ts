import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusColumnOnRewardClaimsTable1760797116610
  implements MigrationInterface
{
  name = 'AddStatusColumnOnRewardClaimsTable1760797116610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2687c61492b88c48f75d31bc4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "UQ_2687c61492b88c48f75d31bc4ff"`,
    );
    await queryRunner.query(`ALTER TABLE "votes" DROP COLUMN "voter_hash"`);
    await queryRunner.query(
      `CREATE TYPE "public"."reward_claims_status_enum" AS ENUM('pending', 'claimed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_claims" ADD "status" "public"."reward_claims_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD CONSTRAINT "FK_921707902dfebffc892270bb9cb" FOREIGN KEY ("vote_id") REFERENCES "votes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" ADD CONSTRAINT "FK_e9ec49f1b23fbb616be3c8ce643" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP CONSTRAINT "FK_e9ec49f1b23fbb616be3c8ce643"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote_rewards" DROP CONSTRAINT "FK_921707902dfebffc892270bb9cb"`,
    );
    await queryRunner.query(`ALTER TABLE "reward_claims" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."reward_claims_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "votes" ADD "voter_hash" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "UQ_2687c61492b88c48f75d31bc4ff" UNIQUE ("voter_hash")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2687c61492b88c48f75d31bc4f" ON "votes" ("voter_hash") `,
    );
  }
}
