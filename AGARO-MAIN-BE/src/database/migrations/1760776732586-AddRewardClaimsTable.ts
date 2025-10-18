import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRewardClaimsTable1760776732586 implements MigrationInterface {
    name = 'AddRewardClaimsTable1760776732586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reward_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "reward_id" uuid NOT NULL, "wallet_address" character varying NOT NULL, "claimed_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_f30d647df5942da2bf0371e2e62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b7790e9364fadcf7bb1cbae74e" ON "reward_claims" ("reward_id", "wallet_address") `);
        await queryRunner.query(`CREATE INDEX "IDX_24d38bed12b7b115c6cfc117ca" ON "reward_claims" ("reward_id") `);
        await queryRunner.query(`ALTER TABLE "reward_claims" ADD CONSTRAINT "FK_24d38bed12b7b115c6cfc117cac" FOREIGN KEY ("reward_id") REFERENCES "vote_rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reward_claims" DROP CONSTRAINT "FK_24d38bed12b7b115c6cfc117cac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_24d38bed12b7b115c6cfc117ca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7790e9364fadcf7bb1cbae74e"`);
        await queryRunner.query(`DROP TABLE "reward_claims"`);
    }

}
