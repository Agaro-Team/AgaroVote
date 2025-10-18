import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVoteRewardsTable1760776459408 implements MigrationInterface {
    name = 'AddVoteRewardsTable1760776459408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vote_rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "vote_id" uuid NOT NULL, "voter_wallet_address" character varying NOT NULL, "poll_id" uuid NOT NULL, "principal_amount" numeric(20,8) NOT NULL DEFAULT '0', "reward_amount" numeric(20,8) NOT NULL DEFAULT '0', "claimable_at" TIMESTAMP, CONSTRAINT "PK_f132e8e36a043c9eebb55efb49f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_daef12000ecfd56d8f235ad7da" ON "vote_rewards" ("vote_id", "poll_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e9ec49f1b23fbb616be3c8ce64" ON "vote_rewards" ("poll_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_921707902dfebffc892270bb9c" ON "vote_rewards" ("vote_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_921707902dfebffc892270bb9c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9ec49f1b23fbb616be3c8ce64"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_daef12000ecfd56d8f235ad7da"`);
        await queryRunner.query(`DROP TABLE "vote_rewards"`);
    }

}
