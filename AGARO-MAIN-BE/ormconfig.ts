import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'agaro_vote_db',
  entities: isProduction
    ? ['dist/src/**/*.entity.js']
    : ['src/**/*.entity{.ts,.js}'],
  migrations: isProduction
    ? ['dist/src/database/migrations/**/*.js']
    : ['src/database/migrations/**/*{.ts,.js}'],
  synchronize: false,
});
