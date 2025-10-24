# Cache Implementation Technical Notes

## Redis Cache Adapter: Keyv + @keyv/redis

### Why This Approach?

The implementation uses **Keyv** with **@keyv/redis** adapter instead of the deprecated `cache-manager-redis-yet`. Here's why:

### 1. Deprecation Notice
`cache-manager-redis-yet` v5.1.5 shows this warning:
```
With cache-manager v6 we now are using Keyv
```

The package explicitly recommends migrating to Keyv as the standard approach.

### 2. Official Support
- **Keyv** is the official storage adapter abstraction for cache-manager v7+
- **@keyv/redis** is the official Redis adapter maintained by the Keyv team
- Active development and community support

### 3. Better Integration
```typescript
// Old approach (deprecated)
import { redisStore } from 'cache-manager-redis-yet';

store: await redisStore({
  socket: { host, port },
  password,
  ttl,
})

// New approach (recommended)
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

const keyv = new Keyv({
  store: new KeyvRedis(redisUrl),
  ttl,
  namespace: 'agaro',
});
```

### 4. Advantages

#### Cleaner Configuration
- Single Redis URL string instead of socket configuration object
- Simpler error handling with event emitters
- Optional namespace for key prefixing

#### Better TypeScript Support
- Improved type definitions
- No peer dependency warnings
- Better IDE autocompletion

#### Consistency
- Same API across different cache stores (Redis, PostgreSQL, MongoDB, etc.)
- Easy to switch between stores for testing or different environments

#### Event Handling
```typescript
keyv.on('error', (err) => {
  console.error('Redis connection error:', err);
});
```

### Implementation Details

#### Connection URL Format
```typescript
// With password
redis://:password@host:port

// Without password
redis://host:port

// Example
redis://:mypassword@localhost:6379
```

#### Namespace Feature
The `namespace: 'agaro'` option automatically prefixes all keys:
- Without namespace: `poll:123`
- With namespace: `agaro:poll:123`

This is useful for:
- Separating environments (dev, staging, prod)
- Avoiding key collisions in shared Redis instances
- Easier cache clearing per application

#### TTL Handling
Both TTL configurations are in milliseconds:
```typescript
const keyv = new Keyv({
  store: new KeyvRedis(redisUrl),
  ttl: redisConfig.ttl * 1000, // Convert seconds to ms
});

return {
  store: keyv,
  ttl: redisConfig.ttl * 1000, // Also set at cache-manager level
};
```

### Compatibility

✅ **Works with**:
- @nestjs/cache-manager: ^3.0.1
- cache-manager: ^7.2.4
- NestJS: ^11.0.0+
- Redis: 6.x, 7.x

✅ **Supports**:
- All cache-manager operations (get, set, del, wrap, etc.)
- TTL per key
- Automatic serialization/deserialization
- Connection pooling
- Reconnection logic

### Performance Considerations

1. **Connection Pooling**: @keyv/redis uses ioredis under the hood with connection pooling
2. **Serialization**: Automatic JSON serialization for complex objects
3. **Pipeline Support**: Batch operations for better performance
4. **Memory Efficiency**: Configurable max items limit

### Migration from cache-manager-redis-yet

If you're migrating from the old approach, the changes are minimal:

**Before:**
```typescript
import { redisStore } from 'cache-manager-redis-yet';

store: await redisStore({
  socket: { host: 'localhost', port: 6379 },
  password: 'password',
  ttl: 300000,
})
```

**After:**
```typescript
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

const keyv = new Keyv({
  store: new KeyvRedis('redis://:password@localhost:6379'),
  ttl: 300000,
  namespace: 'agaro',
});

store: keyv
```

### Environment-Specific Configuration

You can use different Redis instances per environment:

```bash
# Development
REDIS_HOST=localhost
REDIS_PORT=6379

# Production
REDIS_HOST=redis.production.com
REDIS_PORT=6380
REDIS_PASSWORD=strong-password
```

### Monitoring and Debugging

#### Check Connection
```typescript
keyv.on('error', (err) => {
  console.error('Redis connection error:', err);
});
```

#### Redis CLI
```bash
# Connect
docker exec -it agaro-redis redis-cli -a your-password

# List all keys (includes namespace)
KEYS agaro:*

# Get specific key
GET agaro:poll:123

# Check TTL
TTL agaro:poll:123
```

### Future-Proofing

The Keyv ecosystem supports multiple stores out of the box:

```typescript
// Switch to PostgreSQL for testing
import KeyvPostgres from '@keyv/postgres';
const keyv = new Keyv({ store: new KeyvPostgres('postgres://...') });

// Switch to MongoDB
import KeyvMongo from '@keyv/mongo';
const keyv = new Keyv({ store: new KeyvMongo('mongodb://...') });

// Use in-memory for unit tests
const keyv = new Keyv(); // No store = in-memory
```

### Known Issues & Solutions

#### Issue: Connection timeout
**Solution**: Increase Redis `connectTimeout` in production

#### Issue: Memory leaks
**Solution**: Set appropriate `CACHE_MAX_ITEMS` and monitor with `docker stats`

#### Issue: Stale cache
**Solution**: Implement proper cache invalidation on data mutations

### References

- [Keyv Documentation](https://keyv.org/)
- [@keyv/redis GitHub](https://github.com/jaredwray/keyv/tree/main/packages/redis)
- [NestJS Caching](https://docs.nestjs.com/techniques/caching)
- [cache-manager Documentation](https://github.com/node-cache-manager/node-cache-manager)

---

**Implementation Date**: October 23, 2025  
**Library Versions**:
- keyv: ^5.5.3
- @keyv/redis: ^5.1.3
- @nestjs/cache-manager: ^3.0.1
- cache-manager: ^7.2.4
