import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1760465113977 implements MigrationInterface {
  name = 'InitialMigration1760465113977';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "votes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "poll_id" uuid NOT NULL, "choice_id" uuid NOT NULL, "voter_wallet_address" character varying(255) NOT NULL, "voter_hash" character varying(255) NOT NULL, "pool_hash" character varying(255) NOT NULL, "transaction_hash" character varying(255), "block_number" bigint, "signature" text, "vote_weight" integer NOT NULL DEFAULT '1', "voted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2687c61492b88c48f75d31bc4ff" UNIQUE ("voter_hash"), CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_713d1ffcad3cc7b0c03ee6ea3b" ON "votes" ("voted_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3de376cf1231965a35efdb45b" ON "votes" ("pool_hash") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2687c61492b88c48f75d31bc4f" ON "votes" ("voter_hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8d99656c1a5ee5b580a40e5917" ON "votes" ("voter_wallet_address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_33c6b43779deef4290a5b5e284" ON "votes" ("choice_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_176c7eedc76e4c0e41d17fe7a0" ON "votes" ("poll_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vote_stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "poll_id" uuid NOT NULL, "choice_id" uuid NOT NULL, "vote_count" integer NOT NULL DEFAULT '0', "vote_percentage" numeric(5,2) NOT NULL DEFAULT '0', "last_vote_at" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "PK_db135e609598a3a943007c36eac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1a1214bd2cb46014b9c08ddb7a" ON "vote_stats" ("poll_id", "choice_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f10fc1a8be19e4421104e405d" ON "vote_stats" ("choice_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6c1cd7243d7329b271e42ec057" ON "vote_stats" ("poll_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vote_audit_logs_action_enum" AS ENUM('vote_casted', 'vote_attempted', 'vote_rejected', 'stats_updated', 'vote_verified', 'illegal_attempt')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vote_audit_logs_entity_type_enum" AS ENUM('vote', 'vote_stat', 'poll')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vote_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "action" "public"."vote_audit_logs_action_enum" NOT NULL, "entity_type" "public"."vote_audit_logs_entity_type_enum" NOT NULL, "entity_id" character varying(255) NOT NULL, "performed_by" character varying(255) NOT NULL, "old_value" jsonb, "new_value" jsonb, "ip_address" character varying(45), "user_agent" text, "metadata" jsonb, "performed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd8a95f3baf5776513df8f48253" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64a0a3e294d8bbc581fcbe480a" ON "vote_audit_logs" ("performed_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31c5bd2a607420ac7f57623714" ON "vote_audit_logs" ("performed_by") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b877ee27a48bcb7371c45c01c1" ON "vote_audit_logs" ("entity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe21dbdc6781a8f003190367db" ON "vote_audit_logs" ("entity_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9391030f55a051200ddce2ca51" ON "vote_audit_logs" ("action") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user', 'moderator')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "last_login_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."polls_transaction_status_enum" AS ENUM('pending', 'success', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "polls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying(255) NOT NULL, "description" text, "is_private" boolean NOT NULL DEFAULT false, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, "creator_wallet_address" character varying(255) NOT NULL, "pool_hash" character varying(255) NOT NULL, "voter_hash" character varying(255), "transaction_status" "public"."polls_transaction_status_enum" NOT NULL DEFAULT 'pending', "is_active" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_7cf8befc8d1df828fd1091870ed" UNIQUE ("pool_hash"), CONSTRAINT "UQ_873b60065b4a9ee887b15bae7b9" UNIQUE ("voter_hash"), CONSTRAINT "PK_b9bbb8fc7b142553c518ddffbb6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_33aefbc3098eacce44b6101cf6" ON "polls" ("is_private") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9900b62df917a2ed0afff041d5" ON "polls" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99a3e983e439478144be2dedce" ON "polls" ("creator_wallet_address") `,
    );
    await queryRunner.query(
      `CREATE TABLE "poll_choices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "poll_id" uuid NOT NULL, "choice_text" character varying(500) NOT NULL, CONSTRAINT "PK_307c87ec38ce81aa0366da004b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c529e88c9fffe717530f84f830" ON "poll_choices" ("poll_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "poll_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "poll_id" uuid NOT NULL, "wallet_address" character varying(255) NOT NULL, CONSTRAINT "PK_9c429d396f8ff3af48e843a1c6b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d7ee1c106a652e4a17205bb3c" ON "poll_addresses" ("wallet_address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02a392a7bd103a0ac23095f930" ON "poll_addresses" ("poll_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "FK_176c7eedc76e4c0e41d17fe7a04" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "FK_33c6b43779deef4290a5b5e2840" FOREIGN KEY ("choice_id") REFERENCES "poll_choices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "poll_choices" ADD CONSTRAINT "FK_c529e88c9fffe717530f84f8301" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "poll_addresses" ADD CONSTRAINT "FK_02a392a7bd103a0ac23095f9304" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poll_addresses" DROP CONSTRAINT "FK_02a392a7bd103a0ac23095f9304"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poll_choices" DROP CONSTRAINT "FK_c529e88c9fffe717530f84f8301"`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "FK_33c6b43779deef4290a5b5e2840"`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "FK_176c7eedc76e4c0e41d17fe7a04"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02a392a7bd103a0ac23095f930"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6d7ee1c106a652e4a17205bb3c"`,
    );
    await queryRunner.query(`DROP TABLE "poll_addresses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c529e88c9fffe717530f84f830"`,
    );
    await queryRunner.query(`DROP TABLE "poll_choices"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99a3e983e439478144be2dedce"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9900b62df917a2ed0afff041d5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_33aefbc3098eacce44b6101cf6"`,
    );
    await queryRunner.query(`DROP TABLE "polls"`);
    await queryRunner.query(
      `DROP TYPE "public"."polls_transaction_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9391030f55a051200ddce2ca51"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe21dbdc6781a8f003190367db"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b877ee27a48bcb7371c45c01c1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_31c5bd2a607420ac7f57623714"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64a0a3e294d8bbc581fcbe480a"`,
    );
    await queryRunner.query(`DROP TABLE "vote_audit_logs"`);
    await queryRunner.query(
      `DROP TYPE "public"."vote_audit_logs_entity_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."vote_audit_logs_action_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6c1cd7243d7329b271e42ec057"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f10fc1a8be19e4421104e405d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a1214bd2cb46014b9c08ddb7a"`,
    );
    await queryRunner.query(`DROP TABLE "vote_stats"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_176c7eedc76e4c0e41d17fe7a0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_33c6b43779deef4290a5b5e284"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8d99656c1a5ee5b580a40e5917"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2687c61492b88c48f75d31bc4f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3de376cf1231965a35efdb45b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_713d1ffcad3cc7b0c03ee6ea3b"`,
    );
    await queryRunner.query(`DROP TABLE "votes"`);
  }
}
