import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/**
 * CacheService - Wrapper around NestJS Cache Manager for Redis
 *
 * This service provides a clean interface for caching operations
 * following the DDD architecture principles.
 *
 * @example
 * // In your use case or controller:
 * constructor(private cacheService: CacheService) {}
 *
 * async getData(key: string) {
 *   return this.cacheService.get(key);
 * }
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or undefined
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache hit for key: ${key}`);
      } else {
        this.logger.debug(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const ttlMs = ttl ? ttl * 1000 : undefined; // Convert to milliseconds
      await this.cacheManager.set(key, value, ttlMs);
      this.logger.debug(
        `Cached value for key: ${key} with TTL: ${ttl || 'default'}`,
      );
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key to delete
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Deleted cache key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys from cache
   * @param keys Array of cache keys to delete
   */
  async delMany(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      this.logger.debug(`Deleted ${keys.length} cache keys`);
    } catch (error) {
      this.logger.error(`Error deleting multiple cache keys:`, error);
    }
  }

  /**
   * Reset the entire cache (store method dependent)
   */
  async reset(): Promise<void> {
    try {
      // Note: reset() is not available in all cache stores
      // For Redis, you may need to use the store directly
      if (
        'reset' in this.cacheManager &&
        typeof this.cacheManager.reset === 'function'
      ) {
        await (this.cacheManager.reset as () => Promise<void>)();
        this.logger.warn('Cache has been reset');
      } else {
        this.logger.warn(
          'Reset operation not supported by current cache store',
        );
      }
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }

  /**
   * Wrap a function with caching logic
   * @param key Cache key
   * @param fn Function to execute if cache miss
   * @param ttl Time to live in seconds (optional)
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== undefined) {
        return cached;
      }

      const result = await fn();
      await this.set(key, result, ttl);
      return result;
    } catch (error) {
      this.logger.error(`Error in cache wrap for key ${key}:`, error);
      // If caching fails, still return the function result
      return fn();
    }
  }

  /**
   * Generate a cache key with prefix
   * @param prefix Key prefix (e.g., module name)
   * @param identifier Unique identifier
   * @returns Formatted cache key
   */
  generateKey(prefix: string, identifier: string | number): string {
    return `${prefix}:${identifier}`;
  }

  /**
   * Generate a cache key for list operations
   * @param prefix Key prefix
   * @param filters Query filters object
   * @returns Formatted cache key
   */
  generateListKey(prefix: string, filters?: Record<string, any>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return `${prefix}:list`;
    }
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return `${prefix}:list:${filterStr}`;
  }
}
