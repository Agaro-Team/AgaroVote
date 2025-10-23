# Redis Cache Usage Guide

## Overview

This application uses **Redis** as a caching layer to improve performance by reducing database queries and expensive computations. The cache implementation follows the **DDD (Domain-Driven Design)** architecture and is located in the shared infrastructure layer.

## Architecture

```
src/shared/infrastructure/cache/
├── cache.module.ts           # Module configuration
├── cache.service.ts          # Service with cache operations
├── decorators/
│   └── cache.decorator.ts    # Custom decorators
└── index.ts                  # Barrel export
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password-change-this
CACHE_TTL=300              # Default TTL in seconds (5 minutes)
CACHE_MAX_ITEMS=100        # Maximum items in cache
```

### Docker Setup

Redis is configured in `AGARO-DEPENDENCIES/dependencies.yml`:

```bash
cd AGARO-DEPENDENCIES
docker compose up -d agaro-redis
```

## Usage Examples

### 1. Basic Usage in Use Cases

The most common pattern is to use `CacheService` in your use cases:

```typescript
// poll/application/use-cases/get-poll-by-id.use-case.ts
import { Injectable } from '@nestjs/common';
import { CacheService } from '@shared/infrastructure/cache';

@Injectable()
export class GetPollByIdUseCase {
  constructor(
    private pollRepository: IPollRepository,
    private cacheService: CacheService,
  ) {}

  async execute(id: string): Promise<Poll> {
    // Generate cache key
    const cacheKey = this.cacheService.generateKey('poll', id);

    // Try to get from cache first
    const cached = await this.cacheService.get<Poll>(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const poll = await this.pollRepository.findById(id);

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    // Store in cache with 5 minutes TTL
    await this.cacheService.set(cacheKey, poll, 300);

    return poll;
  }
}
```

### 2. Using the Wrap Method

The `wrap` method simplifies the cache-or-fetch pattern:

```typescript
@Injectable()
export class GetAllPollsUseCase {
  constructor(
    private pollRepository: IPollRepository,
    private cacheService: CacheService,
  ) {}

  async execute(filters?: PollFilters): Promise<Poll[]> {
    const cacheKey = this.cacheService.generateListKey('polls', filters);

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        // This function only runs on cache miss
        return this.pollRepository.findAll(filters);
      },
      300, // TTL in seconds
    );
  }
}
```

### 3. Cache Invalidation

Always invalidate cache when data changes:

```typescript
@Injectable()
export class UpdatePollUseCase {
  constructor(
    private pollRepository: IPollRepository,
    private cacheService: CacheService,
  ) {}

  async execute(id: string, dto: UpdatePollDto): Promise<Poll> {
    const poll = await this.pollRepository.update(id, dto);

    // Invalidate cache for this specific poll
    const cacheKey = this.cacheService.generateKey('poll', id);
    await this.cacheService.del(cacheKey);

    // Also invalidate list cache
    await this.cacheService.del('polls:list');

    return poll;
  }
}
```

### 4. Invalidating Multiple Keys

```typescript
@Injectable()
export class DeletePollUseCase {
  constructor(
    private pollRepository: IPollRepository,
    private cacheService: CacheService,
  ) {}

  async execute(id: string): Promise<void> {
    await this.pollRepository.delete(id);

    // Invalidate multiple related cache keys
    const keysToDelete = [
      this.cacheService.generateKey('poll', id),
      'polls:list',
      `polls:list:status=active`,
      `user:${poll.creatorId}:polls`,
    ];

    await this.cacheService.delMany(keysToDelete);
  }
}
```

### 5. Caching Complex Queries

For queries with multiple filters:

```typescript
@Injectable()
export class SearchPollsUseCase {
  constructor(
    private pollRepository: IPollRepository,
    private cacheService: CacheService,
  ) {}

  async execute(searchDto: SearchPollsDto): Promise<Poll[]> {
    // generateListKey creates consistent keys for same filters
    const cacheKey = this.cacheService.generateListKey('polls:search', {
      status: searchDto.status,
      category: searchDto.category,
      page: searchDto.page,
      limit: searchDto.limit,
    });

    return this.cacheService.wrap(
      cacheKey,
      async () => this.pollRepository.search(searchDto),
      600, // Cache for 10 minutes
    );
  }
}
```

### 6. User-Specific Caching

Cache data per user:

```typescript
@Injectable()
export class GetUserPollsUseCase {
  constructor(
    private pollRepository: IPollRepository,
    private cacheService: CacheService,
  ) {}

  async execute(walletAddress: string): Promise<Poll[]> {
    // Include wallet address in cache key
    const cacheKey = `user:${walletAddress}:polls`;

    return this.cacheService.wrap(
      cacheKey,
      async () => this.pollRepository.findByCreator(walletAddress),
      300,
    );
  }
}
```

### 7. Conditional Caching

Cache only expensive operations:

```typescript
@Injectable()
export class GetPollStatisticsUseCase {
  constructor(
    private pollRepository: IPollRepository,
    private cacheService: CacheService,
  ) {}

  async execute(pollId: string): Promise<PollStatistics> {
    const cacheKey = `poll:${pollId}:stats`;

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        // Expensive calculation
        const votes = await this.pollRepository.getVotes(pollId);
        const rewards = await this.pollRepository.getRewards(pollId);
        
        return this.calculateStatistics(votes, rewards);
      },
      60, // Cache for 1 minute (stats change frequently)
    );
  }
}
```

### 8. Cache Reset (Use with Caution)

Reset entire cache (e.g., during maintenance):

```typescript
@Injectable()
export class CacheMaintenanceUseCase {
  constructor(private cacheService: CacheService) {}

  async resetCache(): Promise<void> {
    await this.cacheService.reset();
  }
}
```

## Cache Key Naming Convention

Follow these patterns for consistent cache keys:

| Pattern | Example | Use Case |
|---------|---------|----------|
| `{entity}:{id}` | `poll:123` | Single entity by ID |
| `{entity}:list` | `polls:list` | All entities list |
| `{entity}:list:{filters}` | `polls:list:status=active&category=dao` | Filtered list |
| `user:{address}:{resource}` | `user:0x123...:polls` | User-specific data |
| `{entity}:{id}:{relation}` | `poll:123:votes` | Related entities |
| `{entity}:{id}:{computed}` | `poll:123:stats` | Computed data |

## Best Practices

### ✅ DO

1. **Cache expensive operations**: Database queries, complex calculations, external API calls
2. **Use appropriate TTL**: Short TTL for frequently changing data, longer for stable data
3. **Generate consistent keys**: Use helper methods like `generateKey()` and `generateListKey()`
4. **Invalidate on updates**: Always clear cache when data changes
5. **Handle cache failures gracefully**: The service logs errors but doesn't throw
6. **Use descriptive prefixes**: `poll:`, `user:`, `vote:`, etc.

### ❌ DON'T

1. **Don't cache sensitive data**: Passwords, API keys, private user data
2. **Don't rely solely on cache**: Always have fallback to database
3. **Don't use random keys**: Makes invalidation impossible
4. **Don't cache everything**: Only cache what improves performance
5. **Don't forget to invalidate**: Stale cache causes bugs
6. **Don't use very long TTLs**: Unless data rarely changes

## TTL Guidelines

| Data Type | Recommended TTL | Reason |
|-----------|----------------|---------|
| User profile | 300s (5min) | Changes occasionally |
| Poll details | 300s (5min) | Relatively stable |
| Poll list | 60s (1min) | Changes frequently |
| Vote statistics | 30s (30sec) | Real-time data |
| Dashboard stats | 60s (1min) | Updated regularly |
| Static content | 3600s (1hr) | Rarely changes |
| Search results | 300s (5min) | Depends on freshness needs |

## CacheService API Reference

### `get<T>(key: string): Promise<T | undefined>`
Get a value from cache.

### `set<T>(key: string, value: T, ttl?: number): Promise<void>`
Set a value in cache with optional TTL (in seconds).

### `del(key: string): Promise<void>`
Delete a single key from cache.

### `delMany(keys: string[]): Promise<void>`
Delete multiple keys from cache.

### `reset(): Promise<void>`
Reset entire cache (use with caution).

### `wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>`
Cache-or-fetch pattern - executes function only on cache miss.

### `generateKey(prefix: string, identifier: string | number): string`
Generate a cache key with prefix (e.g., `poll:123`).

### `generateListKey(prefix: string, filters?: Record<string, any>): string`
Generate a cache key for list queries with filters.

## Troubleshooting

### Cache Not Working

1. **Check Redis connection**:
   ```bash
   docker ps | grep agaro-redis
   redis-cli -a your-password ping
   ```

2. **Check environment variables**: Ensure `.env` has correct Redis credentials

3. **Check logs**: CacheService logs all operations at DEBUG level

### Cache Stale Data

1. **Verify invalidation logic**: Make sure cache is cleared on updates
2. **Check TTL**: Reduce TTL for frequently changing data
3. **Use `del` or `delMany`**: Explicitly clear related keys

### Performance Issues

1. **Monitor cache hit rate**: Add logging to track hits vs misses
2. **Optimize key patterns**: Ensure keys are specific enough
3. **Adjust TTL**: Balance freshness vs performance
4. **Check Redis memory**: Monitor with `docker stats agaro-redis`

## Integration with Existing Modules

### Example: Poll Module

```typescript
// poll/poll.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@shared/infrastructure/cache';

@Module({
  imports: [
    CacheModule, // Import cache module
    // ... other imports
  ],
  // ... providers, controllers
})
export class PollModule {}
```

Since `CacheModule` is configured as global (`isGlobal: true`), you can inject `CacheService` anywhere without importing the module again:

```typescript
// Any use case or service
constructor(private cacheService: CacheService) {}
```

## Monitoring

Add custom metrics to track cache performance:

```typescript
@Injectable()
export class CacheMetricsService {
  private hits = 0;
  private misses = 0;

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }
}
```

## Additional Resources

- [NestJS Cache Documentation](https://docs.nestjs.com/techniques/caching)
- [Redis Documentation](https://redis.io/docs/)
- [Keyv Documentation](https://keyv.org/)
- [@keyv/redis Adapter](https://github.com/jaredwray/keyv/tree/main/packages/redis)

## Support

For issues or questions about caching:
1. Check this documentation
2. Review `src/shared/infrastructure/cache/cache.service.ts`
3. Check Redis logs: `docker logs agaro-redis`
4. Consult team architecture documentation
