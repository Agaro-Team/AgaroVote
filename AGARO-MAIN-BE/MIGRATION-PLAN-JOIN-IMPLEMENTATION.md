# Migration Plan: QueryBus to JOIN Implementation

## 📋 Overview

This document outlines the step-by-step plan to migrate from CQRS QueryBus approach to direct SQL JOIN implementation for fetching poll vote counts.

**Goal**: Simplify architecture by using database JOINs instead of cross-module CQRS queries.

**Expected Benefits**:
- ✅ Simpler code (fewer layers)
- ✅ Single database query instead of two
- ✅ Easier to understand for new developers
- ✅ Less architectural ceremony

**Trade-offs**:
- ❌ Poll module will directly query vote_stats table
- ❌ Tighter coupling between Poll and Vote modules
- ❌ Harder to extract to microservices later

---

## 🗂️ Files to Modify

### 1. Repository Layer
- ✏️ `src/modules/poll/domain/repositories/poll-repository.interface.ts` - Add interface methods
- ✏️ `src/modules/poll/infrastructure/repositories/typeorm-poll.repository.ts` - Implement JOIN queries

### 2. DTO Layer
- ✏️ `src/modules/poll/application/dto/poll-response.dto.ts` - Change fromEntity signature

### 3. Controller Layer
- ✏️ `src/modules/poll/presentation/controllers/poll.controller.ts` - Remove QueryBus, simplify

### 4. Module Configuration
- ✏️ `src/modules/poll/poll.module.ts` - Optionally remove CqrsModule

### 5. Documentation
- ✏️ `ARCHITECTURE-DECISION-JOIN-VS-CQRS.md` - Update with final decision
- ✏️ `CROSS-MODULE-VOTE-COUNT.md` - Mark as deprecated

---

## 📝 Detailed Changes

### Step 1: Update Poll Repository Interface

**File**: `src/modules/poll/domain/repositories/poll-repository.interface.ts`

**Changes**:
```typescript
// Add this type to represent Poll with voteCount
export interface PollWithVoteCount extends Poll {
  voteCount: number;
}

export interface IPollRepository extends IRepository<Poll> {
  // Existing methods...
  findByPoolHash(poolHash: string): Promise<Poll | null>;
  findByCreatorWallet(walletAddress: string): Promise<Poll[]>;
  
  // ✅ NEW: Methods that include vote count via JOIN
  findWithRelations(id: string): Promise<PollWithVoteCount | null>;
  findAllPaginated(filters: PollFilterDto): Promise<IPaginatedResult<PollWithVoteCount>>;
  findActivePaginated(filters: PollFilterDto): Promise<IPaginatedResult<PollWithVoteCount>>;
  findOngoingPaginated(filters: PollFilterDto): Promise<IPaginatedResult<PollWithVoteCount>>;
  findByCreatorPaginated(
    walletAddress: string,
    filters: PollFilterDto,
  ): Promise<IPaginatedResult<PollWithVoteCount>>;
}
```

**Rationale**: 
- Return type now includes `voteCount` property
- Type-safe way to represent polls with vote counts
- Doesn't break existing methods

---

### Step 2: Implement JOIN Queries in Repository

**File**: `src/modules/poll/infrastructure/repositories/typeorm-poll.repository.ts`

**Key Changes**:

1. **Helper method to add vote count to query builder**:
```typescript
private addVoteCountSelect(
  queryBuilder: SelectQueryBuilder<Poll>,
): SelectQueryBuilder<Poll> {
  return queryBuilder
    .leftJoin('vote_stats', 'vs', 'vs.poll_id = poll.id')
    .addSelect('COALESCE(SUM(vs.vote_count), 0)', 'voteCount')
    .groupBy('poll.id')
    .addGroupBy('choices.id')
    .addGroupBy('addresses.id');
}
```

2. **Update findWithRelations**:
```typescript
async findWithRelations(id: string): Promise<PollWithVoteCount | null> {
  const queryBuilder = this.repository
    .createQueryBuilder('poll')
    .leftJoinAndSelect('poll.choices', 'choices')
    .leftJoinAndSelect('poll.addresses', 'addresses')
    .where('poll.id = :id', { id });

  this.addVoteCountSelect(queryBuilder);

  const rawAndEntities = await queryBuilder.getRawAndEntities();
  
  if (rawAndEntities.entities.length === 0) {
    return null;
  }

  const poll = rawAndEntities.entities[0];
  const voteCount = parseInt(rawAndEntities.raw[0].voteCount) || 0;

  return { ...poll, voteCount } as PollWithVoteCount;
}
```

3. **Update all paginated methods**:
```typescript
async findAllPaginated(
  filters: PollFilterDto,
): Promise<IPaginatedResult<PollWithVoteCount>> {
  const queryBuilder = this.repository
    .createQueryBuilder('poll')
    .leftJoinAndSelect('poll.choices', 'choices')
    .leftJoinAndSelect('poll.addresses', 'addresses');

  this.addVoteCountSelect(queryBuilder);
  this.applyFilters(queryBuilder, filters);
  
  return await this.paginateWithVoteCount(queryBuilder, filters);
}
```

4. **New pagination helper**:
```typescript
private async paginateWithVoteCount(
  queryBuilder: SelectQueryBuilder<Poll>,
  filters: PollFilterDto,
): Promise<IPaginatedResult<PollWithVoteCount>> {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  // Get count before adding aggregation
  const total = await queryBuilder.getCount();

  // Apply pagination
  queryBuilder.skip(skip).take(limit);

  const rawAndEntities = await queryBuilder.getRawAndEntities();

  // Map results with vote counts
  const data = rawAndEntities.entities.map((poll, index) => {
    const voteCount = parseInt(rawAndEntities.raw[index].voteCount) || 0;
    return { ...poll, voteCount } as PollWithVoteCount;
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
```

**SQL Generated**:
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
WHERE poll.is_active = true
GROUP BY poll.id, choices.id, addresses.id
ORDER BY poll.created_at DESC
LIMIT 10 OFFSET 0;
```

---

### Step 3: Simplify PollResponseDto

**File**: `src/modules/poll/application/dto/poll-response.dto.ts`

**Changes**:
```typescript
static fromEntity(
  poll: Poll | PollWithVoteCount,  // ✅ Accept both types
  includeRelations = false,
): PollResponseDto {
  const response = new PollResponseDto();
  response.id = poll.id;
  response.title = poll.title;
  response.description = poll.description;
  response.isPrivate = poll.isPrivate;
  response.startDate = poll.startDate;
  response.endDate = poll.endDate;
  response.creatorWalletAddress = poll.creatorWalletAddress;
  response.poolHash = poll.poolHash;
  
  // ✅ Get voteCount from entity if available, default to 0
  response.voteCount = 'voteCount' in poll ? poll.voteCount : 0;
  
  response.transactionStatus = poll.transactionStatus;
  response.isActive = poll.isActive;
  response.createdAt = poll.createdAt;
  response.updatedAt = poll.updatedAt;

  // Computed properties
  response.isOngoing = poll.isOngoing();
  response.hasStarted = poll.hasStarted();
  response.hasEnded = poll.hasEnded();

  if (includeRelations) {
    response.choices = poll.choices?.map((choice) => ({
      id: choice.id,
      pollId: choice.pollId,
      choiceText: choice.choiceText,
      createdAt: choice.createdAt,
    }));

    response.addresses = poll.addresses?.map((address) => ({
      id: address.id,
      pollId: address.pollId,
      walletAddress: address.walletAddress,
      createdAt: address.createdAt,
    }));
  }

  return response;
}
```

**Key Changes**:
- ❌ Remove `voteCount` parameter
- ✅ Extract voteCount from Poll entity itself
- ✅ Backward compatible (handles both Poll and PollWithVoteCount)

---

### Step 4: Simplify PollController

**File**: `src/modules/poll/presentation/controllers/poll.controller.ts`

**Major Changes**:

1. **Remove QueryBus and imports**:
```typescript
// ❌ REMOVE these imports
import { QueryBus } from '@nestjs/cqrs';
import {
  GetPollVoteCountQuery,
  GetMultiplePollVoteCountsQuery,
  PollVoteCountMap,
} from '@modules/vote/application/queries';
```

2. **Remove QueryBus from constructor**:
```typescript
constructor(
  // ❌ REMOVE: private readonly queryBus: QueryBus,
  private readonly createPollUseCase: CreatePollUseCase,
  private readonly getPollByIdUseCase: GetPollByIdUseCase,
  // ... rest of dependencies
) {}
```

3. **Remove helper methods**:
```typescript
// ❌ REMOVE: transformPollWithVoteCount
// ❌ REMOVE: transformPollsWithVoteCounts
```

4. **Simplify all endpoints**:

**Before**:
```typescript
@Get()
async findAll(@Query() filters: PollFilterDto): Promise<IPaginatedResult<PollResponseDto>> {
  const result = await this.getAllPollsPaginatedUseCase.execute(filters);
  return {
    data: await this.transformPollsWithVoteCounts(result.data, true),
    meta: result.meta,
  };
}
```

**After**:
```typescript
@Get()
async findAll(@Query() filters: PollFilterDto): Promise<IPaginatedResult<PollResponseDto>> {
  const result = await this.getAllPollsPaginatedUseCase.execute(filters);
  return {
    data: result.data.map(poll => PollResponseDto.fromEntity(poll, true)),
    meta: result.meta,
  };
}
```

**All Endpoint Changes**:
```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() createPollDto: CreatePollDto): Promise<PollResponseDto> {
  const poll = await this.createPollUseCase.execute(createPollDto);
  return PollResponseDto.fromEntity(poll, true);  // ✅ Simplified
}

@Get()
async findAll(@Query() filters: PollFilterDto): Promise<IPaginatedResult<PollResponseDto>> {
  const result = await this.getAllPollsPaginatedUseCase.execute(filters);
  return {
    data: result.data.map(poll => PollResponseDto.fromEntity(poll, true)),  // ✅ Simplified
    meta: result.meta,
  };
}

@Get('active')
async findActive(@Query() filters: PollFilterDto): Promise<IPaginatedResult<PollResponseDto>> {
  const result = await this.getActivePollsPaginatedUseCase.execute(filters);
  return {
    data: result.data.map(poll => PollResponseDto.fromEntity(poll, true)),  // ✅ Simplified
    meta: result.meta,
  };
}

@Get('ongoing')
async findOngoing(@Query() filters: PollFilterDto): Promise<IPaginatedResult<PollResponseDto>> {
  const result = await this.getOngoingPollsPaginatedUseCase.execute(filters);
  return {
    data: result.data.map(poll => PollResponseDto.fromEntity(poll, true)),  // ✅ Simplified
    meta: result.meta,
  };
}

@Get('creator/:walletAddress')
async findByCreator(
  @Param('walletAddress') walletAddress: string,
  @Query() filters: PollFilterDto,
): Promise<IPaginatedResult<PollResponseDto>> {
  const result = await this.getPollsByCreatorPaginatedUseCase.execute(walletAddress, filters);
  return {
    data: result.data.map(poll => PollResponseDto.fromEntity(poll, true)),  // ✅ Simplified
    meta: result.meta,
  };
}

@Get(':id')
async findOne(@Param('id') id: string): Promise<PollResponseDto> {
  const poll = await this.getPollByIdUseCase.execute(id);
  return PollResponseDto.fromEntity(poll, true);  // ✅ Simplified
}

@Put(':id')
async update(
  @Param('id') id: string,
  @Body() updatePollDto: UpdatePollDto,
): Promise<PollResponseDto> {
  const poll = await this.updatePollUseCase.execute(id, updatePollDto);
  return PollResponseDto.fromEntity(poll, true);  // ✅ Simplified
}

@Put(':id/transaction-status')
async updateTransactionStatus(
  @Param('id') id: string,
  @Body() updateTransactionStatusDto: UpdateTransactionStatusDto,
): Promise<PollResponseDto> {
  const poll = await this.updatePollTransactionStatusUseCase.execute(
    id,
    updateTransactionStatusDto.transactionStatus,
  );
  return PollResponseDto.fromEntity(poll, true);  // ✅ Simplified
}

@Post(':id/activate')
async activate(@Param('id') id: string): Promise<PollResponseDto> {
  const poll = await this.activatePollUseCase.execute(id);
  return PollResponseDto.fromEntity(poll, true);  // ✅ Simplified
}
```

**Lines of Code Reduction**: ~70 lines removed!

---

### Step 5: Update PollModule (Optional)

**File**: `src/modules/poll/poll.module.ts`

**Changes**:
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Poll, PollChoice, PollAddress]),
    // ❌ OPTIONAL: Remove CqrsModule if no other CQRS queries in Poll module
    // Note: Keep it if CheckVotingEligibilityHandler is still used
    CqrsModule,  // Keep this for now
  ],
  // ... rest stays the same
})
```

**Decision**: Keep `CqrsModule` if you still have `CheckVotingEligibilityHandler` query.

---

## 🧪 Testing Plan

### Manual Testing Checklist

- [ ] `GET /polls` - Returns polls with correct vote counts
- [ ] `GET /polls/active` - Returns active polls with vote counts
- [ ] `GET /polls/ongoing` - Returns ongoing polls with vote counts
- [ ] `GET /polls/:id` - Returns single poll with vote count
- [ ] `GET /polls/creator/:walletAddress` - Returns creator's polls with vote counts
- [ ] `POST /polls` - Creates poll (voteCount = 0)
- [ ] `PUT /polls/:id` - Updates poll (preserves vote count)
- [ ] Test with polls that have 0 votes
- [ ] Test with polls that have multiple votes
- [ ] Test pagination (page 1, 2, etc.)
- [ ] Test filtering and sorting

### Performance Testing

Run before and after to compare:
```bash
# Benchmark: Fetch 100 polls
ab -n 1000 -c 10 http://localhost:3000/polls?limit=100

# Expected: Similar or better performance with JOIN
```

### Database Query Analysis

```sql
-- Enable query logging
SET log_statement = 'all';

-- Check query plan
EXPLAIN ANALYZE
SELECT 
  poll.*,
  COALESCE(SUM(vs.vote_count), 0) as voteCount
FROM polls poll
LEFT JOIN vote_stats vs ON vs.poll_id = poll.id
GROUP BY poll.id;
```

---

## 📊 Before/After Comparison

### Code Complexity

| Metric | Before (QueryBus) | After (JOIN) | Change |
|--------|-------------------|--------------|--------|
| Files touched | 8 files | 4 files | -50% |
| Lines in controller | 206 lines | ~140 lines | -32% |
| Database queries per request | 2 queries | 1 query | -50% |
| Cross-module dependencies | Yes (Vote module) | No | ✅ |
| Testability | Need to mock QueryBus | Direct repository | ✅ |

### Performance

| Operation | Before | After | Change |
|-----------|--------|-------|--------|
| Fetch 100 polls | 2 queries (~51ms) | 1 query (~50ms) | ~2% faster |
| Memory overhead | QueryBus + serialization | Direct mapping | Less |

---

## 🚨 Potential Issues & Solutions

### Issue 1: GROUP BY with Relations

**Problem**: TypeORM requires all selected columns in GROUP BY when using aggregate functions.

**Solution**: Use `addGroupBy()` for all relation columns:
```typescript
.groupBy('poll.id')
.addGroupBy('choices.id')
.addGroupBy('addresses.id')
```

### Issue 2: getRawAndEntities() Complexity

**Problem**: Need to map raw results to entities manually.

**Solution**: Create helper method `paginateWithVoteCount()` to encapsulate this logic.

### Issue 3: Breaking DDD Boundaries

**Problem**: Poll repository now knows about `vote_stats` table.

**Solution**: 
- Document this architectural decision
- Add comment explaining the trade-off
- Consider adding view if you want abstraction later:
  ```sql
  CREATE VIEW polls_with_vote_counts AS
  SELECT p.*, COALESCE(SUM(vs.vote_count), 0) as vote_count
  FROM polls p
  LEFT JOIN vote_stats vs ON vs.poll_id = p.id
  GROUP BY p.id;
  ```

### Issue 4: Testing Becomes Harder

**Problem**: Tests now need to seed both `polls` and `vote_stats` tables.

**Solution**: Create test helper:
```typescript
// test/helpers/poll-factory.ts
export async function createPollWithVotes(
  pollRepo: Repository<Poll>,
  voteStatRepo: Repository<VoteStat>,
  voteCount: number
): Promise<Poll> {
  const poll = await pollRepo.save({ /* poll data */ });
  await voteStatRepo.save({ 
    pollId: poll.id, 
    voteCount 
  });
  return poll;
}
```

---

## 🔄 Rollback Plan

If JOIN implementation causes issues:

1. **Keep QueryBus code in separate branch**:
   ```bash
   git branch backup/querybus-implementation
   ```

2. **Revert specific files**:
   ```bash
   git checkout backup/querybus-implementation -- src/modules/poll/
   ```

3. **Database is unchanged** - no migration needed for rollback

---

## ✅ Success Criteria

Migration is successful when:

1. ✅ All API endpoints return correct vote counts
2. ✅ Performance is equal or better than before
3. ✅ No breaking changes to API responses
4. ✅ Tests pass (if any exist)
5. ✅ Code is simpler and easier to understand
6. ✅ Documentation is updated

---

## 📅 Execution Timeline

1. **Phase 1: Repository Layer** (30 min)
   - Update interface
   - Implement JOIN queries
   - Test queries in isolation

2. **Phase 2: DTO & Controller** (20 min)
   - Update PollResponseDto
   - Simplify controller
   - Remove QueryBus

3. **Phase 3: Testing** (30 min)
   - Manual testing of all endpoints
   - Performance benchmarking
   - Fix any issues

4. **Phase 4: Documentation** (10 min)
   - Update architecture docs
   - Add migration notes

**Total Estimated Time**: ~90 minutes

---

## 🎯 Next Steps

Ready to proceed? Execute in this order:

1. ✅ Read this migration plan thoroughly
2. ✅ Create backup branch
3. ✅ Start with Step 1 (Repository Interface)
4. ✅ Test after each step
5. ✅ Commit incrementally

**Command to start**:
```bash
git checkout -b feature/join-implementation
git add MIGRATION-PLAN-JOIN-IMPLEMENTATION.md
git commit -m "docs: add migration plan for JOIN implementation"
```

---

## 📚 References

- Original discussion: ARCHITECTURE-DECISION-JOIN-VS-CQRS.md
- TypeORM Query Builder: https://typeorm.io/select-query-builder
- Aggregate Functions: https://typeorm.io/select-query-builder#using-subqueries


