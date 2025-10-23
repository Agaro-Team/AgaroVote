# Redis Cache - Quick Start Guide

## Setup (One-time)

### 1. Start Redis Container
```bash
cd AGARO-DEPENDENCIES
docker compose up -d agaro-redis
```

### 2. Update .env (Already Done)
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password-change-this
CACHE_TTL=300
CACHE_MAX_ITEMS=100
```

## Usage in Your Code

### Basic Pattern (Recommended)

```typescript
import { CacheService } from '@shared/infrastructure/cache';

@Injectable()
export class YourUseCase {
  constructor(
    private readonly repository: IYourRepository,
    private readonly cacheService: CacheService, // ← Inject this
  ) {}

  async execute(id: string): Promise<YourEntity> {
    const cacheKey = this.cacheService.generateKey('your-entity', id);

    return this.cacheService.wrap(
      cacheKey,
      async () => this.repository.findById(id), // ← Your existing code
      300, // ← TTL in seconds (5 minutes)
    );
  }
}
```

### Cache Invalidation

```typescript
async update(id: string, dto: UpdateDto): Promise<Entity> {
  const result = await this.repository.update(id, dto);
  
  // Delete cache after update
  await this.cacheService.del(
    this.cacheService.generateKey('entity', id)
  );
  
  return result;
}
```

## API Reference

```typescript
// Get from cache
await cacheService.get<T>(key)

// Set to cache
await cacheService.set(key, value, ttl)

// Delete from cache
await cacheService.del(key)

// Delete multiple keys
await cacheService.delMany([key1, key2])

// Cache-or-fetch (recommended)
await cacheService.wrap(key, async () => fetchData(), ttl)

// Generate keys
cacheService.generateKey('entity', id) // → 'entity:123'
cacheService.generateListKey('entities', filters) // → 'entities:list:status=active'
```

## Cache Key Patterns

```typescript
// Single entity
'poll:123'
'user:0x123...'
'vote:456'

// Lists
'polls:list'
'polls:list:status=active'
'user:0x123...:polls'

// Computed data
'poll:123:stats'
'dashboard:stats'
```

## Recommended TTL Values

| Data Type | TTL |
|-----------|-----|
| Single entity (poll, user) | 300s (5min) |
| Lists | 60s (1min) |
| Stats/Dashboard | 60s (1min) |
| Search results | 300s (5min) |
| Static content | 3600s (1hr) |

## Testing

```bash
# Check if Redis is running
docker ps | grep agaro-redis

# Connect to Redis CLI
docker exec -it agaro-redis redis-cli -a your-redis-password

# List all keys
KEYS *

# Get a key
GET poll:123

# Delete a key
DEL poll:123
```

## Common Commands

```bash
# Start Redis
cd AGARO-DEPENDENCIES && docker compose up -d agaro-redis

# Stop Redis
docker compose stop agaro-redis

# View Redis logs
docker logs agaro-redis

# Check Redis memory
docker stats agaro-redis
```

## Complete Example

```typescript
// use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CacheService } from '@shared/infrastructure/cache';

@Injectable()
export class GetPollByIdUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    private readonly cacheService: CacheService,
  ) {}

  // Get with caching
  async execute(id: string): Promise<Poll> {
    const cacheKey = this.cacheService.generateKey('poll', id);

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const poll = await this.pollRepository.findWithRelations(id);
        if (!poll) {
          throw new NotFoundException(`Poll with id ${id} not found`);
        }
        return poll;
      },
      300,
    );
  }
}

@Injectable()
export class UpdatePollUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    private readonly cacheService: CacheService,
  ) {}

  // Update and invalidate cache
  async execute(id: string, dto: UpdatePollDto): Promise<Poll> {
    const poll = await this.pollRepository.update(id, dto);

    // Clear cache
    await this.cacheService.delMany([
      this.cacheService.generateKey('poll', id),
      'polls:list',
    ]);

    return poll;
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cache not working | Check Redis container: `docker ps \| grep redis` |
| Stale data | Add cache invalidation on updates |
| Connection error | Check `.env` for correct REDIS_PASSWORD |
| Type errors | Run `yarn ts:check` |

## Documentation

- **Full Guide**: `CACHE_USAGE.md`
- **Examples**: `CACHE_IMPLEMENTATION_EXAMPLES.md`
- **This File**: Quick reference

---

**That's it!** Just inject `CacheService` and use `wrap()` method. 🚀
