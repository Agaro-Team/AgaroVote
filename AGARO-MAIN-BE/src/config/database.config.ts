import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';

export default registerAs('database', (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME || 'agaro_vote_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
    migrationsRun: false,
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            ca: fs.readFileSync(
              '/etc/letsencrypt/live/ardial.my.id/fullchain.pem',
              'utf8',
            ),
            key: fs.readFileSync(
              '/etc/letsencrypt/live/ardial.my.id/privkey.pem',
              'utf8',
            ),
            cert: fs.readFileSync(
              '/etc/letsencrypt/live/ardial.my.id/cert.pem',
              'utf8',
            ),
            rejectUnauthorized: true,
          }
        : false,
  };
});
