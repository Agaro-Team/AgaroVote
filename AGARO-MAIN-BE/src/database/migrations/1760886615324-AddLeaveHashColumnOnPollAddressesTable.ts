import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeaveHashColumnOnPollAddressesTable1760886615324
  implements MigrationInterface
{
  name = 'AddLeaveHashColumnOnPollAddressesTable1760886615324';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poll_addresses" ADD "leave_hash" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poll_addresses" DROP COLUMN "leave_hash"`,
    );
  }
}
