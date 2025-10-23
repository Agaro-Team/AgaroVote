# Cache Implementation Examples

This document shows practical examples of how Redis cache has been integrated into the AgaroVote backend following the DDD architecture.

## File Structure

```
src/
├── shared/
│   └── infrastructure/
│       └── cache/
│           ├── cache.module.ts       # ✅ Created (using Keyv + @keyv/redis)
│           ├── cache.service.ts      # ✅ Created
│           ├── decorators/
│           │   └── cache.decorator.ts # ✅ Created
│           └── index.ts              # ✅ Created
├── config/
│   ├── config.module.ts             # ✅ Updated (added redisConfig)
│   └── redis.config.ts              # ✅ Created
└── app.module.ts                    # ✅ Updated (imported CacheModule)
```

## Example 1: Caching Poll Details (Recommended Pattern)

Here's how you would implement caching in the `GetPollByIdUseCase`:

```typescript
// src/modules/poll/application/use-cases/get-poll-by-id.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { Poll } from '@modules/poll/domain/entities/poll.entity';
import { CacheService } from '@shared/infrastructure/cache';

@Injectable()
export class GetPollByIdUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    private readonly cacheService: CacheService, // Inject CacheService
  ) {}

  async execute(id: string): Promise<Poll> {
    // Generate cache key
    const cacheKey = this.cacheService.generateKey('poll', id);

    // Use wrap method for cache-or-fetch pattern
    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const poll = await this.pollRepository.findWithRelations(id);

        if (!poll) {
          throw new NotFoundException(`Poll with id ${id} not found`);
        }

        return poll;
      },
      300, // Cache for 5 minutes
    );
  }
}
```

## Example 2: Caching Poll List

```typescript
// src/modules/poll/application/use-cases/get-all-polls.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { Poll } from '@modules/poll/domain/entities/poll.entity';
import { CacheService } from '@shared/infrastructure/cache';
import { GetAllPollsDto } from '../dto/get-all-polls.dto';

@Injectable()
export class GetAllPollsUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(dto?: GetAllPollsDto): Promise<Poll[]> {
    // Generate cache key with filters
    const cacheKey = this.cacheService.generateListKey('polls', {
      status: dto?.status,
      page: dto?.page,
      limit: dto?.limit,
    });

    return this.cacheService.wrap(
      cacheKey,
      async () => this.pollRepository.findAll(dto),
      60, // Cache for 1 minute (list changes frequently)
    );
  }
}
```

## Example 3: Cache Invalidation on Update

```typescript
// src/modules/poll/application/use-cases/update-poll.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { Poll } from '@modules/poll/domain/entities/poll.entity';
import { CacheService } from '@shared/infrastructure/cache';
import { UpdatePollDto } from '../dto/update-poll.dto';

@Injectable()
export class UpdatePollUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(id: string, dto: UpdatePollDto): Promise<Poll> {
    const poll = await this.pollRepository.findById(id);

    if (!poll) {
      throw new NotFoundException(`Poll with id ${id} not found`);
    }

    // Update poll
    const updatedPoll = await this.pollRepository.update(id, dto);

    // Invalidate related caches
    await this.cacheService.delMany([
      this.cacheService.generateKey('poll', id),
      'polls:list', // Invalidate all list caches
    ]);

    return updatedPoll;
  }
}
```

## Example 4: Caching User-Specific Data

```typescript
// src/modules/poll/application/use-cases/get-user-polls.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import {
  POLL_REPOSITORY,
  type IPollRepository,
} from '@modules/poll/domain/repositories/poll-repository.interface';
import { Poll } from '@modules/poll/domain/entities/poll.entity';
import { CacheService } from '@shared/infrastructure/cache';

@Injectable()
export class GetUserPollsUseCase {
  constructor(
    @Inject(POLL_REPOSITORY)
    private readonly pollRepository: IPollRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(walletAddress: string): Promise<Poll[]> {
    // User-specific cache key
    const cacheKey = `user:${walletAddress.toLowerCase()}:polls`;

    return this.cacheService.wrap(
      cacheKey,
      async () => this.pollRepository.findByCreator(walletAddress),
      300, // Cache for 5 minutes
    );
  }
}
```

## Example 5: Caching Dashboard Statistics

```typescript
// src/modules/dashboard/application/use-cases/get-dashboard-stats.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { CacheService } from '@shared/infrastructure/cache';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    private readonly pollRepository: IPollRepository,
    private readonly voteRepository: IVoteRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(): Promise<DashboardStats> {
    const cacheKey = 'dashboard:stats';

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        // Expensive aggregation queries
        const [totalPolls, totalVotes, activeUsers] = await Promise.all([
          this.pollRepository.count(),
          this.voteRepository.count(),
          this.voteRepository.countUniqueVoters(),
        ]);

        return {
          totalPolls,
          totalVotes,
          activeUsers,
          timestamp: new Date(),
        };
      },
      60, // Cache for 1 minute
    );
  }
}
```

## Example 6: Manual Cache Management

For cases where you need more control:

```typescript
// src/modules/vote/application/use-cases/create-vote.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import {
  VOTE_REPOSITORY,
  type IVoteRepository,
} from '@modules/vote/domain/repositories/vote-repository.interface';
import { Vote } from '@modules/vote/domain/entities/vote.entity';
import { CacheService } from '@shared/infrastructure/cache';
import { CreateVoteDto } from '../dto/create-vote.dto';

@Injectable()
export class CreateVoteUseCase {
  constructor(
    @Inject(VOTE_REPOSITORY)
    private readonly voteRepository: IVoteRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(dto: CreateVoteDto, walletAddress: string): Promise<Vote> {
    // Create vote
    const vote = await this.voteRepository.create({
      ...dto,
      voterAddress: walletAddress,
    });

    // Invalidate related caches
    const keysToInvalidate = [
      // Poll cache
      this.cacheService.generateKey('poll', dto.pollId),
      // Poll votes list
      `poll:${dto.pollId}:votes`,
      // User votes
      `user:${walletAddress.toLowerCase()}:votes`,
      // Dashboard stats
      'dashboard:stats',
    ];

    await this.cacheService.delMany(keysToInvalidate);

    return vote;
  }
}
```

## Integration Steps for Existing Modules

To add caching to any existing module:

### Step 1: Import CacheModule (if not global)

```typescript
// module.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@shared/infrastructure/cache';

@Module({
  imports: [
    CacheModule, // Add this
    // ... other imports
  ],
})
export class YourModule {}
```

### Step 2: Inject CacheService in Use Cases

```typescript
constructor(
  // ... existing dependencies
  private readonly cacheService: CacheService,
) {}
```

### Step 3: Implement Caching Logic

Choose one of these patterns:

**Pattern A: Using wrap() (Recommended)**
```typescript
return this.cacheService.wrap(cacheKey, async () => {
  // Your existing logic here
}, ttl);
```

**Pattern B: Manual caching**
```typescript
const cached = await this.cacheService.get<T>(cacheKey);
if (cached) return cached;

const result = await this.repository.someMethod();
await this.cacheService.set(cacheKey, result, ttl);
return result;
```

### Step 4: Add Cache Invalidation

In update/delete use cases:
```typescript
await this.cacheService.del(cacheKey);
// or
await this.cacheService.delMany([key1, key2, key3]);
```

## Testing with Cache

### Running Redis

```bash
cd AGARO-DEPENDENCIES
docker compose up -d agaro-redis
```

### Verifying Cache

```bash
# Connect to Redis
docker exec -it agaro-redis redis-cli -a your-redis-password

# List all keys
KEYS *

# Get a specific key
GET poll:123

# Check TTL
TTL poll:123

# Delete a key
DEL poll:123

# Flush all (caution!)
FLUSHALL
```

## Performance Monitoring

Add logging to track cache performance:

```typescript
async execute(id: string): Promise<Poll> {
  const startTime = Date.now();
  const cacheKey = this.cacheService.generateKey('poll', id);
  
  const result = await this.cacheService.wrap(
    cacheKey,
    async () => {
      console.log(`Cache MISS for ${cacheKey}`);
      return this.pollRepository.findWithRelations(id);
    },
    300,
  );
  
  const duration = Date.now() - startTime;
  console.log(`Fetched ${cacheKey} in ${duration}ms`);
  
  return result;
}
```

## Common Patterns Summary

| Use Case | Cache Key Pattern | TTL | Invalidation |
|----------|------------------|-----|--------------|
| Get by ID | `entity:id` | 300s | On update/delete |
| Get all list | `entity:list` | 60s | On any create/update/delete |
| Filtered list | `entity:list:filter1=value1&filter2=value2` | 60s | On matching updates |
| User data | `user:address:resource` | 300s | On user resource change |
| Stats/Aggregations | `stats:type` | 60s | On data change |
| Search results | `search:query:params` | 300s | On relevant data change |

## Next Steps

1. **Start with read-heavy endpoints**: Poll details, user profiles, dashboard stats
2. **Add cache invalidation**: Update and delete operations
3. **Monitor performance**: Check logs for hit rates
4. **Adjust TTLs**: Based on data freshness requirements
5. **Optimize keys**: Use consistent patterns across the app

## Complete Implementation Checklist

- [x] Redis configured in Docker
- [x] Environment variables set
- [x] CacheModule created
- [x] CacheService implemented
- [x] Decorators created (optional, for future use)
- [x] CacheModule imported in AppModule
- [x] Documentation created
- [ ] Implement caching in Poll module
- [ ] Implement caching in Vote module
- [ ] Implement caching in Dashboard module
- [ ] Add cache invalidation in update operations
- [ ] Test cache hit/miss rates
- [ ] Monitor Redis memory usage

## Support

For questions or issues:
1. Check `CACHE_USAGE.md` for detailed usage guide
2. Review examples in this file
3. Check Redis logs: `docker logs agaro-redis`
4. Verify environment variables in `.env`
