import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClaimedAtColumnOnVoteRewardsTable1760806806368 implements MigrationInterface {
    name = 'AddClaimedAtColumnOnVoteRewardsTable1760806806368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote_rewards" ADD "claimed_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote_rewards" DROP COLUMN "claimed_at"`);
    }

}
