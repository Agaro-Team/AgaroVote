import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheService } from './cache.service';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  ttl: number;
  max: number;
}

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfig>('redis');

        if (!redisConfig) {
          throw new Error('Redis configuration not found');
        }

        // Build Redis connection URL
        const redisUrl = redisConfig.password
          ? `redis://:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`
          : `redis://${redisConfig.host}:${redisConfig.port}`;

        // Create Keyv instance with Redis store
        const keyv = new Keyv({
          store: new KeyvRedis(redisUrl),
          ttl: redisConfig.ttl * 1000, // Convert to milliseconds
          namespace: 'agaro', // Optional: prefix all keys with 'agaro:'
        });

        // Handle connection errors
        keyv.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        return {
          store: keyv,
          ttl: redisConfig.ttl * 1000,
          max: redisConfig.max,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
