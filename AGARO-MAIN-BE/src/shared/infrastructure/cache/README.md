# Cache Module

Redis-based caching infrastructure for the AgaroVote backend using **Keyv** + **@keyv/redis**.

## Overview

This module provides a clean, DDD-compliant interface for caching operations using Redis as the backing store. It uses the modern Keyv abstraction layer (recommended by cache-manager v7+) instead of deprecated adapters.

## Structure

```
cache/
├── cache.module.ts           # Module configuration with Redis store
├── cache.service.ts          # Service with all cache operations
├── decorators/
│   └── cache.decorator.ts    # Custom decorators (optional)
└── index.ts                  # Barrel exports
```

## Quick Start

### 1. Inject the Service

```typescript
import { CacheService } from '@shared/infrastructure/cache';

constructor(private readonly cacheService: CacheService) {}
```

### 2. Use It

```typescript
// Cache-or-fetch pattern (recommended)
const result = await this.cacheService.wrap(
  'my-key',
  async () => this.expensiveOperation(),
  300, // TTL in seconds
);

// Manual caching
const cached = await this.cacheService.get<MyType>('key');
if (!cached) {
  const data = await this.fetchData();
  await this.cacheService.set('key', data, 300);
  return data;
}
return cached;

// Invalidation
await this.cacheService.del('key');
await this.cacheService.delMany(['key1', 'key2']);
```

## API

| Method | Description |
|--------|-------------|
| `get<T>(key)` | Get from cache |
| `set(key, value, ttl?)` | Set to cache (ttl in seconds) |
| `del(key)` | Delete key |
| `delMany(keys[])` | Delete multiple keys |
| `wrap(key, fn, ttl?)` | Cache-or-fetch |
| `reset()` | Clear all cache |
| `generateKey(prefix, id)` | Generate consistent key |
| `generateListKey(prefix, filters?)` | Generate list key |

## Configuration

Configured via environment variables in `.env`:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
CACHE_TTL=300
CACHE_MAX_ITEMS=100
```

## Documentation

- **Quick Start**: `../../CACHE_QUICK_START.md`
- **Full Guide**: `../../CACHE_USAGE.md`
- **Examples**: `../../CACHE_IMPLEMENTATION_EXAMPLES.md`
- **Setup Summary**: `../../CACHE_SETUP_SUMMARY.md`
- **Technical Details**: `../../CACHE_TECHNICAL_NOTES.md` (Why Keyv + @keyv/redis)

## Best Practices

1. **Use `wrap()` method** - Simplest and most error-resistant
2. **Generate keys consistently** - Use helper methods
3. **Set appropriate TTLs** - Balance freshness vs performance
4. **Invalidate on writes** - Clear cache when data changes
5. **Handle errors gracefully** - Service logs but doesn't throw

## Example

```typescript
@Injectable()
export class GetPollByIdUseCase {
  constructor(
    private readonly pollRepository: IPollRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(id: string): Promise<Poll> {
    return this.cacheService.wrap(
      this.cacheService.generateKey('poll', id),
      async () => {
        const poll = await this.pollRepository.findById(id);
        if (!poll) throw new NotFoundException();
        return poll;
      },
      300,
    );
  }
}
```

## Testing

```bash
# Check Redis
docker ps | grep redis

# Connect to Redis CLI
docker exec -it agaro-redis redis-cli -a your-password

# List keys
KEYS *

# Get value
GET poll:123
```

---

For detailed documentation, see `CACHE_QUICK_START.md` in the project root.
