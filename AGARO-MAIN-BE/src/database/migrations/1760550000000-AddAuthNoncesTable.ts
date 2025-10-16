import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddAuthNoncesTable1760550000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create auth_nonces table
    await queryRunner.createTable(
      new Table({
        name: 'auth_nonces',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'wallet_address',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'nonce',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create index on wallet_address
    await queryRunner.createIndex(
      'auth_nonces',
      new TableIndex({
        name: 'IDX_AUTH_NONCES_WALLET_ADDRESS',
        columnNames: ['wallet_address'],
      }),
    );

    // Create composite index on wallet_address and expires_at for efficient queries
    await queryRunner.createIndex(
      'auth_nonces',
      new TableIndex({
        name: 'IDX_AUTH_NONCES_WALLET_EXPIRES',
        columnNames: ['wallet_address', 'expires_at'],
      }),
    );

    // Create index on nonce for quick lookups
    await queryRunner.createIndex(
      'auth_nonces',
      new TableIndex({
        name: 'IDX_AUTH_NONCES_NONCE',
        columnNames: ['nonce'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('auth_nonces', 'IDX_AUTH_NONCES_NONCE');
    await queryRunner.dropIndex(
      'auth_nonces',
      'IDX_AUTH_NONCES_WALLET_EXPIRES',
    );
    await queryRunner.dropIndex(
      'auth_nonces',
      'IDX_AUTH_NONCES_WALLET_ADDRESS',
    );

    // Drop table
    await queryRunner.dropTable('auth_nonces');
  }
}
