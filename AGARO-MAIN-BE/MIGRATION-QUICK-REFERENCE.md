# Quick Reference: JOIN Implementation Migration

## 🎯 TL;DR

**What**: Replace CQRS QueryBus with SQL JOIN for poll vote counts  
**Why**: Simpler code, single query, easier to understand  
**Trade-off**: Tighter coupling, harder to extract to microservices later

---

## 📝 Files to Change (4 total)

### 1. Repository Interface
**File**: `src/modules/poll/domain/repositories/poll-repository.interface.ts`

```typescript
// Add this type
export interface PollWithVoteCount extends Poll {
  voteCount: number;
}

// Change return types
findWithRelations(id: string): Promise<PollWithVoteCount | null>;
findAllPaginated(filters: PollFilterDto): Promise<IPaginatedResult<PollWithVoteCount>>;
```

### 2. Repository Implementation
**File**: `src/modules/poll/infrastructure/repositories/typeorm-poll.repository.ts`

```typescript
// Add helper method
private addVoteCountSelect(qb: SelectQueryBuilder<Poll>) {
  return qb
    .leftJoin('vote_stats', 'vs', 'vs.poll_id = poll.id')
    .addSelect('COALESCE(SUM(vs.vote_count), 0)', 'voteCount')
    .groupBy('poll.id')
    .addGroupBy('choices.id')
    .addGroupBy('addresses.id');
}

// Update findWithRelations
async findWithRelations(id: string): Promise<PollWithVoteCount | null> {
  const qb = this.repository.createQueryBuilder('poll')
    .leftJoinAndSelect('poll.choices', 'choices')
    .leftJoinAndSelect('poll.addresses', 'addresses')
    .where('poll.id = :id', { id });
  
  this.addVoteCountSelect(qb);
  const rawAndEntities = await qb.getRawAndEntities();
  
  if (rawAndEntities.entities.length === 0) return null;
  
  const poll = rawAndEntities.entities[0];
  const voteCount = parseInt(rawAndEntities.raw[0].voteCount) || 0;
  return { ...poll, voteCount } as PollWithVoteCount;
}

// Similar changes for all paginated methods
```

### 3. DTO
**File**: `src/modules/poll/application/dto/poll-response.dto.ts`

```typescript
static fromEntity(
  poll: Poll | PollWithVoteCount,  // ✅ Accept both
  includeRelations = false,
  // ❌ Remove voteCount parameter
): PollResponseDto {
  // ...
  response.voteCount = 'voteCount' in poll ? poll.voteCount : 0;  // ✅ Get from entity
  // ...
}
```

### 4. Controller
**File**: `src/modules/poll/presentation/controllers/poll.controller.ts`

```typescript
// ❌ REMOVE
import { QueryBus } from '@nestjs/cqrs';
import { GetPollVoteCountQuery, GetMultiplePollVoteCountsQuery } from '@modules/vote/...';

// ❌ REMOVE from constructor
private readonly queryBus: QueryBus,

// ❌ REMOVE helper methods
private async transformPollWithVoteCount() { ... }
private async transformPollsWithVoteCounts() { ... }

// ✅ SIMPLIFY all endpoints
@Get()
async findAll(@Query() filters: PollFilterDto) {
  const result = await this.getAllPollsPaginatedUseCase.execute(filters);
  return {
    data: result.data.map(poll => PollResponseDto.fromEntity(poll, true)),
    meta: result.meta,
  };
}

// Repeat for all endpoints: create, findOne, findActive, findOngoing, etc.
```

---

## 🔧 SQL Generated

**Before (QueryBus)**: 2 queries
```sql
-- Query 1
SELECT * FROM polls WHERE ...;

-- Query 2  
SELECT poll_id, SUM(vote_count) FROM vote_stats WHERE poll_id IN (...) GROUP BY poll_id;
```

**After (JOIN)**: 1 query
```sql
SELECT 
  poll.*,
  choices.*,
  addresses.*,
  COALESCE(SUM(vs.vote_count), 0) as voteCount
FROM polls poll
LEFT JOIN poll_choices choices ON choices.poll_id = poll.id
LEFT JOIN poll_addresses addresses ON addresses.poll_id = poll.id
LEFT JOIN vote_stats vs ON vs.poll_id = poll.id
WHERE ...
GROUP BY poll.id, choices.id, addresses.id;
```

---

## ✅ Testing Checklist

```bash
# 1. Test all endpoints
curl http://localhost:3000/polls
curl http://localhost:3000/polls/active
curl http://localhost:3000/polls/ongoing
curl http://localhost:3000/polls/{id}

# 2. Verify vote counts are correct
# - Polls with 0 votes should show voteCount: 0
# - Polls with votes should show actual count

# 3. Test pagination
curl http://localhost:3000/polls?page=1&limit=10
curl http://localhost:3000/polls?page=2&limit=10

# 4. Performance benchmark (optional)
ab -n 1000 -c 10 http://localhost:3000/polls?limit=100
```

---

## 🚨 Common Issues & Fixes

### Issue: GROUP BY error
```
Error: column "poll.title" must appear in GROUP BY clause
```

**Fix**: Add all columns to GROUP BY
```typescript
.groupBy('poll.id')
.addGroupBy('poll.title')
.addGroupBy('poll.description')
// ... OR use poll.id if id is primary key (Postgres allows this)
```

### Issue: voteCount is string instead of number
```typescript
// ❌ Wrong
const voteCount = rawAndEntities.raw[0].voteCount;  // Returns "42" (string)

// ✅ Correct
const voteCount = parseInt(rawAndEntities.raw[0].voteCount) || 0;  // Returns 42 (number)
```

### Issue: Relations duplicated in GROUP BY
```
Error: ambiguous column name
```

**Fix**: Be explicit with table aliases
```typescript
.groupBy('poll.id')
.addGroupBy('choices.id')
.addGroupBy('addresses.id')
```

---

## 📊 Code Reduction

- **Lines removed**: ~70 lines
- **Files changed**: 4 files
- **Dependencies removed**: Cross-module CQRS queries
- **Queries reduced**: 2 queries → 1 query

---

## 🔄 Rollback Plan

```bash
# If something breaks, rollback immediately
git stash
git checkout main

# Or keep backup branch
git branch backup/querybus-implementation
```

---

## 💡 Pro Tips

1. **Test incrementally**: Test after each file change
2. **Commit often**: Commit after each successful step
3. **Keep docs updated**: Update ARCHITECTURE-DECISION-JOIN-VS-CQRS.md
4. **Monitor performance**: Check query execution time
5. **Add indexes**: Ensure `vote_stats.poll_id` is indexed (should already be)

---

## ⏱️ Estimated Time

- Repository changes: 30 min
- DTO & Controller: 20 min  
- Testing: 30 min
- Documentation: 10 min

**Total**: ~90 minutes

---

## 🎯 Success Metrics

✅ All endpoints return correct vote counts  
✅ Performance >= previous implementation  
✅ Code is simpler and more readable  
✅ No breaking API changes  

---

## 📞 Need Help?

- See full details: `MIGRATION-PLAN-JOIN-IMPLEMENTATION.md`
- Check architecture decision: `ARCHITECTURE-DECISION-JOIN-VS-CQRS.md`
- TypeORM docs: https://typeorm.io/select-query-builder


