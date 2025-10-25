#!/usr/bin/env node

/**
 * Script to verify environment configuration is loaded correctly
 * Usage: node scripts/verify-env.js
 */

const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

console.log('='.repeat(60));
console.log('Environment Configuration Verification');
console.log('='.repeat(60));

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`\n1. NODE_ENV: ${nodeEnv}`);

// Check which .env files exist
const projectRoot = path.resolve(__dirname, '..');
const envFiles = [`.env.${nodeEnv}`, '.env.local', '.env'];

console.log('\n2. Checking .env files:');
envFiles.forEach((file) => {
  const filePath = path.join(projectRoot, file);
  const exists = fs.existsSync(filePath);
  console.log(
    `   ${exists ? '✅' : '❌'} ${file} ${exists ? '(exists)' : '(not found)'}`,
  );
});

// Load env using same logic as ormconfig.ts
console.log('\n3. Loading environment variables:');
let loadedFile = null;
for (const envFile of envFiles) {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    console.log(`   Loading: ${envFile}`);
    config({ path: envPath });
    loadedFile = envFile;
    break;
  }
}

if (!loadedFile) {
  console.log('   ❌ No .env file found!');
  process.exit(1);
}

// Verify database configuration
console.log('\n4. Database Configuration:');
const dbConfig = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD ? '***' : undefined,
};

Object.entries(dbConfig).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`   ${status} ${key}: ${value || '(not set)'}`);
});

// Verify other critical env vars
console.log('\n5. Other Configuration:');
const otherConfig = {
  JWT_SECRET: process.env.JWT_SECRET ? '***' : undefined,
  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
  PORT: process.env.PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
};

Object.entries(otherConfig).forEach(([key, value]) => {
  const status = value ? '✅' : '⚠️';
  console.log(`   ${status} ${key}: ${value || '(not set)'}`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ Environment verification complete!');
console.log('='.repeat(60));
console.log(`\nLoaded from: ${loadedFile}`);
console.log(
  `Database: ${dbConfig.DB_USERNAME}@${dbConfig.DB_HOST}:${dbConfig.DB_PORT}/${dbConfig.DB_NAME}`,
);
console.log('');
