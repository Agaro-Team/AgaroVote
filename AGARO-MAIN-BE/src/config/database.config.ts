import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'root',
    password: (() => {
      if (!process.env.DB_PASSWORD) {
        throw new Error(
          'Database password (DB_PASSWORD) must be set in environment variables.',
        );
      }
      return process.env.DB_PASSWORD;
    })(),
    database: process.env.DB_NAME || 'agaro_vote_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
    migrationsRun: false,
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: true, 
            require: true,
          }
        : false,
  }),
);
