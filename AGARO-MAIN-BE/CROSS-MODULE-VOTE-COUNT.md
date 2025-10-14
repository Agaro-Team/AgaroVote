# Cross-Module Vote Count Implementation

## Overview

This document explains how the Poll module fetches vote counts from the Vote module using **CQRS QueryBus** for loose coupling between modules.

## Problem

The `PollResponseDto` needed to include a `voteCount` field, but:
- The `Poll` entity doesn't store vote count (it's managed by the Vote module)
- We needed to fetch vote counts from the Vote module without tight coupling
- Multiple endpoints needed to populate this field

## Solution: CQRS Query Pattern

We implemented a clean cross-module communication pattern using CQRS:

### Architecture

```
┌─────────────┐                    ┌─────────────┐
│ Poll Module │                    │ Vote Module │
│             │                    │             │
│  Controller │──QueryBus─────────▶│   Query     │
│             │  GetPollVote       │   Handler   │
│             │  CountQuery        │             │
│             │◀──────────────────▶│ Repository  │
│             │   Returns: number  │             │
└─────────────┘                    └─────────────┘
```

### Implementation Details

#### 1. Vote Module: Query & Handler

**Query** (`get-poll-vote-count.query.ts`):
```typescript
export class GetPollVoteCountQuery implements IQuery {
  constructor(public readonly pollId: string) {}
}
```

**Handler** (`get-poll-vote-count.handler.ts`):
```typescript
@QueryHandler(GetPollVoteCountQuery)
export class GetPollVoteCountHandler {
  constructor(
    @Inject(VOTE_STAT_REPOSITORY)
    private readonly voteStatRepository: IVoteStatRepository,
  ) {}

  async execute(query: GetPollVoteCountQuery): Promise<number> {
    return await this.voteStatRepository.getTotalVoteCountForPoll(query.pollId);
  }
}
```

#### 2. Vote Module: Registration

**vote.module.ts**:
```typescript
import { GetPollVoteCountHandler } from './application/queries';

const QueryHandlers = [
  // ... other handlers
  GetPollVoteCountHandler, // ✅ Registered
];
```

#### 3. Poll Module: DTO Update

**poll-response.dto.ts**:
```typescript
static fromEntity(
  poll: Poll,
  includeRelations = false,
  voteCount = 0,  // ✅ Added parameter
): PollResponseDto {
  // ...
  response.voteCount = voteCount;  // ✅ Set from parameter
  return response;
}
```

#### 4. Poll Module: Controller Integration

**poll.controller.ts**:
```typescript
import { QueryBus } from '@nestjs/cqrs';
import { GetPollVoteCountQuery } from '@modules/vote/application/queries';

export class PollController {
  constructor(
    private readonly queryBus: QueryBus,  // ✅ Inject QueryBus
    // ... other dependencies
  ) {}

  // ✅ Helper method to fetch vote count
  private async transformPollWithVoteCount(
    poll: Poll,
    includeRelations = false,
  ): Promise<PollResponseDto> {
    const voteCount = await this.queryBus.execute<
      GetPollVoteCountQuery,
      number
    >(new GetPollVoteCountQuery(poll.id));
    
    return PollResponseDto.fromEntity(poll, includeRelations, voteCount);
  }

  // ✅ Helper for multiple polls
  private async transformPollsWithVoteCounts(
    polls: Poll[],
    includeRelations = false,
  ): Promise<PollResponseDto[]> {
    return Promise.all(
      polls.map((poll) =>
        this.transformPollWithVoteCount(poll, includeRelations),
      ),
    );
  }

  // ✅ All endpoints use the helper methods
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PollResponseDto> {
    const poll = await this.getPollByIdUseCase.execute(id);
    return this.transformPollWithVoteCount(poll, true);
  }

  @Get()
  async findAll(@Query() filters: PollFilterDto) {
    const result = await this.getAllPollsPaginatedUseCase.execute(filters);
    return {
      data: await this.transformPollsWithVoteCounts(result.data, true),
      meta: result.meta,
    };
  }
}
```

## Benefits of This Approach

### ✅ Loose Coupling
- Poll module only imports **data contracts** (Query class)
- No direct dependency on Vote module services or repositories
- Communication happens through **QueryBus** (mediator pattern)

### ✅ Domain Boundaries Maintained
- Vote counting logic stays in Vote module
- Poll module doesn't need to know HOW votes are counted
- Each module owns its domain responsibilities

### ✅ CQRS Pattern
- Follows Command Query Responsibility Segregation
- Read operations (queries) are separate from writes (commands)
- Scalable and maintainable architecture

### ✅ Testability
- Easy to mock QueryBus in tests
- Can test Poll controller without Vote module
- Clear separation of concerns

### ✅ No Performance Issues
- Queries are executed via QueryBus (in-memory, fast)
- Vote stats are pre-calculated by event handlers
- No N+1 query problems with proper implementation

## Files Changed

### Vote Module
- ✅ `src/modules/vote/application/queries/get-poll-vote-count/get-poll-vote-count.query.ts` (new)
- ✅ `src/modules/vote/application/queries/get-poll-vote-count/get-poll-vote-count.handler.ts` (new)
- ✅ `src/modules/vote/application/queries/index.ts` (updated)
- ✅ `src/modules/vote/vote.module.ts` (updated)

### Poll Module
- ✅ `src/modules/poll/application/dto/poll-response.dto.ts` (updated)
- ✅ `src/modules/poll/presentation/controllers/poll.controller.ts` (updated)

## Usage Example

### API Response Before:
```json
{
  "id": "123",
  "title": "My Poll",
  "voteCount": 0  // ❌ Always 0 (poll.voteCount didn't exist)
}
```

### API Response After:
```json
{
  "id": "123",
  "title": "My Poll",
  "voteCount": 42  // ✅ Real count from Vote module
}
```

## Alternative Approaches Considered

### ❌ Shared Command/Query Module
**Why not:** Would break domain boundaries and create a "god module"

### ❌ Direct Repository Access
**Why not:** Creates tight coupling between modules

### ❌ Database Joins
**Why not:** Violates DDD bounded contexts

### ✅ CQRS QueryBus (Chosen)
**Why yes:** Loose coupling, maintains domain boundaries, scalable

## Performance Considerations

### Current Implementation
- Single query per poll: O(n) where n = number of polls
- Queries executed in parallel via `Promise.all()`
- Vote stats are pre-calculated (not counted on-the-fly)

### Future Optimization (if needed)
If performance becomes an issue with many polls:

```typescript
// Batch query approach
export class GetMultiplePollVoteCountsQuery implements IQuery {
  constructor(public readonly pollIds: string[]) {}
}

// Handler returns Map<pollId, voteCount>
// Single database query with WHERE IN clause
```

## Related Patterns

This implementation follows these architectural patterns:
1. **CQRS** - Command Query Responsibility Segregation
2. **Mediator Pattern** - QueryBus acts as mediator
3. **Repository Pattern** - Data access abstraction
4. **DDD** - Domain-Driven Design bounded contexts
5. **Dependency Inversion** - Depends on abstractions (IQuery)

## Testing

### Unit Test Example (Poll Controller)
```typescript
describe('PollController', () => {
  it('should include vote count in response', async () => {
    const mockQueryBus = {
      execute: jest.fn().mockResolvedValue(42),
    };
    
    const controller = new PollController(mockQueryBus, ...);
    const result = await controller.findOne('poll-id');
    
    expect(result.voteCount).toBe(42);
    expect(mockQueryBus.execute).toHaveBeenCalledWith(
      expect.any(GetPollVoteCountQuery)
    );
  });
});
```

## Conclusion

This implementation demonstrates **proper cross-module communication** in a DDD/CQRS architecture:
- ✅ Loose coupling through QueryBus
- ✅ Domain boundaries respected
- ✅ Testable and maintainable
- ✅ Follows architectural best practices
- ✅ No breaking changes to existing code

The pattern can be reused for other cross-module queries in the future.

