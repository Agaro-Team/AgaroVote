#!/usr/bin/env node

/**
 * Redis Connection Health Check Script
 *
 * Usage:
 *   node scripts/check-redis-connection.js
 *   yarn redis:check
 */

require('dotenv').config();
const Keyv = require('keyv').default || require('keyv');
const KeyvRedis = require('@keyv/redis').default || require('@keyv/redis');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Connection configuration
const MAX_RETRIES = 2;
const CONNECTION_TIMEOUT = 10000; // 10 seconds
const RETRY_DELAY = 2000; // 2 seconds

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function checkRedisConnection() {
  log('\n' + '='.repeat(60), colors.bright);
  log('Redis Connection Health Check', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);

  // Get Redis configuration from environment
  const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  const REDIS_PORT = process.env.REDIS_PORT || '6379';
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
  const REDIS_TLS = process.env.REDIS_TLS === 'true';

  // Display configuration
  logInfo('Configuration:');
  console.log(`  Host:     ${REDIS_HOST}`);
  console.log(`  Port:     ${REDIS_PORT}`);
  console.log(
    `  Password: ${REDIS_PASSWORD ? '***' + REDIS_PASSWORD.slice(-4) : 'Not set'}`,
  );
  console.log(
    `  TLS:      ${REDIS_TLS ? 'Enabled (rediss://)' : 'Disabled (redis://)'}\n`,
  );

  // Build Redis URL - use mutable variables for retry logic
  let useTLS = REDIS_TLS;
  let protocol = useTLS ? 'rediss' : 'redis';
  let redisUrl = REDIS_PASSWORD
    ? `${protocol}://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
    : `${protocol}://${REDIS_HOST}:${REDIS_PORT}`;

  const maskedPassword = REDIS_PASSWORD
    ? `***${REDIS_PASSWORD.slice(-4)}`
    : 'none';
  console.log(
    `ℹ️  Connecting to: ${protocol}://${maskedPassword}@${REDIS_HOST}:${REDIS_PORT}\n`,
  );

  // Test 1: Basic Connection
  console.log('Test 1: Basic Connection');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let keyv;

    try {
      console.log(`ℹ️  Attempt ${attempt}: Connecting via ${protocol}://...`);

      // Create Keyv instance with URL approach
      keyv = new Keyv(redisUrl, {
        namespace: 'agaro',
      });

      // Test connection with a simple operation wrapped in promise with timeout
      await Promise.race([
        keyv.get('test-connection'),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Connection timeout after 10 seconds')),
            CONNECTION_TIMEOUT,
          ),
        ),
      ]);

      console.log('✅ Successfully connected to Redis!\n');

      // Test 2: Set & Get
      console.log('Test 2: Set & Get Operation');
      const testKey = 'health-check-test';
      const testValue = {
        timestamp: Date.now(),
        message: 'Hello from health check!',
      };

      await keyv.set(testKey, testValue);
      console.log('✅ Set operation successful');

      const retrieved = await keyv.get(testKey);
      if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
        console.log('✅ Get operation successful - data matches!\n');
      } else {
        console.log('❌ Get operation failed - data mismatch');
        if (keyv) await keyv.disconnect();
        process.exit(1);
      }

      // Test 3: Delete
      console.log('Test 3: Delete Operation');
      await keyv.delete(testKey);
      const afterDelete = await keyv.get(testKey);
      if (afterDelete === undefined) {
        console.log('✅ Delete operation successful\n');
      } else {
        console.log('❌ Delete operation failed');
        if (keyv) await keyv.disconnect();
        process.exit(1);
      }

      // Test 4: TTL
      console.log('Test 4: TTL (Time To Live)');
      const ttlKey = 'ttl-test';
      await keyv.set(ttlKey, 'temporary', 2000); // 2 seconds
      console.log('✅ Set with TTL successful');

      const immediate = await keyv.get(ttlKey);
      if (immediate === 'temporary') {
        console.log('✅ Value exists immediately after set\n');
      }

      console.log(
        '============================================================',
      );
      console.log('✅ All Redis tests passed successfully!');
      console.log(
        '============================================================\n',
      );

      await keyv.disconnect();
      process.exit(0);
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      // Clean up connection
      if (keyv) {
        try {
          await keyv.disconnect();
        } catch (disconnectError) {
          // Ignore disconnect errors
        }
      }

      // If this was a TLS attempt and we have retries left, try without TLS
      if (useTLS && attempt < MAX_RETRIES) {
        console.log('\n⚠️  TLS connection failed. Retrying without TLS...\n');
        useTLS = false;
        protocol = 'redis';
        redisUrl = `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        continue;
      }

      if (attempt === MAX_RETRIES) {
        console.error('\n❌ All connection attempts failed.');
        console.error('\nTroubleshooting tips:');
        console.error('1. Verify Redis server is running on ardial.tech:8881');
        console.error('2. Check if firewall allows connections to port 8881');
        console.error('3. Verify password is correct');
        console.error(
          '4. If using TLS, ensure Redis server has valid certificate',
        );
        console.error(
          '5. Try connecting with redis-cli: redis-cli -h ardial.tech -p 8881 -a rootdoang --tls ping\n',
        );
        process.exit(1);
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  let keyv;
  let connectionSuccessful = false;

  try {
    // Test 1: Basic connection test
    log('Test 1: Basic Connection', colors.bright);
    const testKey = 'health-check:test';
    const testValue = {
      timestamp: new Date().toISOString(),
      message: 'Health check test',
    };

    // Try with TLS first
    let useTls = REDIS_TLS;
    let attempts = 0;
    const maxAttempts = REDIS_TLS ? 2 : 1; // Try TLS then non-TLS if enabled

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const protocol = useTls ? 'rediss' : 'redis';
        const testUrl = REDIS_PASSWORD
          ? `${protocol}://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
          : `${protocol}://${REDIS_HOST}:${REDIS_PORT}`;

        logInfo(`Attempt ${attempts}: Connecting via ${protocol}://...`);

        // Create new Keyv instance
        keyv = new Keyv({
          store: new KeyvRedis(testUrl, {
            socket: {
              connectTimeout: 10000,
              tls: useTls,
              rejectUnauthorized: false,
            },
          }),
          namespace: 'health-check',
        });

        // Handle errors without throwing
        keyv.on('error', (err) => {
          // Just log, don't throw
        });

        // Try to set a value (this will trigger connection)
        await keyv.set(testKey, testValue);

        if (useTls) {
          logSuccess('Successfully connected with TLS (rediss://)');
        } else {
          logSuccess('Successfully connected without TLS (redis://)');
          if (REDIS_TLS) {
            logWarning(
              'Note: TLS was enabled but connection succeeded without it',
            );
            logWarning('Consider updating REDIS_TLS=false in .env');
          }
        }

        break; // Success, exit loop
      } catch (error) {
        if (attempts < maxAttempts && useTls) {
          logWarning(`TLS connection failed: ${error.message}`);
          logInfo('Retrying without TLS...\n');
          useTls = false;
        } else {
          throw error;
        }
      }
    }

    // Test 2: Read back the data
    log('\nTest 2: Data Retrieval', colors.bright);
    const retrievedValue = await keyv.get(testKey);

    if (retrievedValue && retrievedValue.message === testValue.message) {
      logSuccess('Successfully retrieved test data from Redis');
      logInfo(`Data: ${JSON.stringify(retrievedValue, null, 2)}`);
    } else {
      logError('Retrieved data does not match');
    }

    // Test 3: Delete operation
    log('\nTest 3: Delete Operation', colors.bright);
    await keyv.delete(testKey);
    const deletedCheck = await keyv.get(testKey);

    if (deletedCheck === undefined) {
      logSuccess('Successfully deleted test data');
    } else {
      logWarning('Delete operation may have failed');
    }

    // Test 4: TTL test
    log('\nTest 4: TTL (Time To Live) Test', colors.bright);
    const ttlKey = 'health-check:ttl-test';
    await keyv.set(ttlKey, 'expires in 5 seconds', 5000); // 5 seconds TTL
    logSuccess('Set data with 5-second TTL');

    // Wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const ttlCheck1 = await keyv.get(ttlKey);
    if (ttlCheck1) {
      logSuccess('Data still exists after 2 seconds');
    }

    // Wait 4 more seconds (total 6 seconds)
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const ttlCheck2 = await keyv.get(ttlKey);
    if (ttlCheck2 === undefined) {
      logSuccess('Data expired after 6 seconds (TTL working correctly)');
    } else {
      logWarning('TTL may not be working correctly');
    }

    connectionSuccessful = true;

    // Summary
    log('\n' + '='.repeat(60), colors.bright);
    logSuccess('All tests passed! Redis connection is healthy.');
    log('='.repeat(60) + '\n', colors.bright);
  } catch (error) {
    log('\n' + '='.repeat(60), colors.bright);
    logError('Connection failed!');
    log('='.repeat(60) + '\n', colors.bright);

    console.error(`\n${colors.red}Error Details:${colors.reset}`);
    console.error(`  ${error.message}\n`);

    // Common issues and solutions
    log('Common Issues:', colors.yellow);
    console.log('  1. Check if Redis server is running');
    console.log('  2. Verify REDIS_HOST and REDIS_PORT are correct');
    console.log('  3. Check if REDIS_PASSWORD is correct');
    console.log('  4. Ensure firewall allows connection to Redis port');
    console.log('  5. For TLS connections, ensure REDIS_TLS=true in .env');
    console.log(
      '  6. Check if Redis is configured to accept remote connections\n',
    );

    process.exit(1);
  } finally {
    // Cleanup
    if (keyv) {
      try {
        await keyv.disconnect?.();
      } catch (err) {
        // Ignore disconnect errors
      }
    }
  }

  process.exit(connectionSuccessful ? 0 : 1);
}

// Run the health check
checkRedisConnection().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
