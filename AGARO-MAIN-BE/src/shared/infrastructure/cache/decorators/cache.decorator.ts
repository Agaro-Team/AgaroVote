import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to set cache TTL (Time To Live) for a route handler
 *
 * @param ttl Time to live in seconds
 *
 * @example
 * @Get('users')
 * @CacheTTL(60) // Cache for 60 seconds
 * async getUsers() {
 *   return this.userService.findAll();
 * }
 */
export const CacheTTL = (ttl: number) => SetMetadata('cache_ttl', ttl);

/**
 * Decorator to set cache key for a route handler
 *
 * @param key Cache key or key pattern
 *
 * @example
 * @Get('user/:id')
 * @CacheKey('user')
 * async getUser(@Param('id') id: string) {
 *   return this.userService.findById(id);
 * }
 */
export const CacheKey = (key: string) => SetMetadata('cache_key', key);

/**
 * Metadata keys for cache decorators
 */
export const CACHE_TTL_METADATA = 'cache_ttl';
export const CACHE_KEY_METADATA = 'cache_key';
