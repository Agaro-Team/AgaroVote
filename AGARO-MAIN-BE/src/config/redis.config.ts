import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true', // Enable TLS/SSL (rediss://)
  ttl: parseInt(process.env.CACHE_TTL || '300', 10), // Default 5 minutes (in seconds)
  max: parseInt(process.env.CACHE_MAX_ITEMS || '100', 10), // Maximum number of items in cache
}));
