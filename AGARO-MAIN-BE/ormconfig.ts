import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables with fallback logic
// Priority: .env.{NODE_ENV} > .env.local > .env
const nodeEnv = process.env.NODE_ENV || 'development';
const envFiles = [
  `.env.${nodeEnv}`, // .env.development, .env.production, etc.
  '.env.local', // Local overrides
  '.env', // Default fallback
];

// Load the first existing env file
for (const envFile of envFiles) {
  const envPath = path.resolve(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    console.log(`[ORM Config] Loading environment from: ${envFile}`);
    config({ path: envPath });
    break;
  }
}

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
