# Voting Pools Hooks

This directory contains reusable hooks for managing voting pools state and data fetching.

## Hooks

### `useVotingPoolsFilters`

A reusable hook for managing voting pools filter state via URL parameters. This hook centralizes all filter logic and provides type-safe state management.

#### Features

- ✅ **URL State Persistence** - Filters survive page refresh and can be shared via URL
- ✅ **Type-Safe** - Full TypeScript support with enums and interfaces
- ✅ **Default Values** - Sensible defaults matching backend expectations
- ✅ **Helper Methods** - Convenient methods for common operations
- ✅ **Centralized Logic** - Single source of truth for filter state

#### Usage

```tsx
import { useVotingPoolsFilters } from './hooks/use-voting-pools-filters';

function MyComponent() {
  const { 
    filters,           // Current filter values
    setFilters,        // Update filters
    resetFilters,      // Reset to defaults
    toggleSortOrder,   // Toggle ASC/DESC
    hasActiveFilters   // Check if filters are active
  } = useVotingPoolsFilters();

  // Update search
  setFilters({ q: 'governance' });

  // Update sort
  setFilters({ 
    sortBy: PollSortBy.TITLE, 
    order: SortOrder.ASC 
  });

  // Toggle sort order
  toggleSortOrder();

  // Reset all filters
  resetFilters();

  return (
    <div>
      {hasActiveFilters && <button onClick={resetFilters}>Clear Filters</button>}
      <p>Searching for: {filters.q}</p>
    </div>
  );
}
```

#### Filter Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `number` | `9` | Number of items per page |
| `q` | `string` | `''` | Search query (title/description) |
| `sortBy` | `PollSortBy` | `CREATED_AT` | Field to sort by |
| `order` | `SortOrder` | `DESC` | Sort order (ASC/DESC) |
| `isActive` | `boolean` | `true` | Show only active polls |

#### Sort Options

The `sortBy` parameter accepts these values:

- `PollSortBy.CREATED_AT` - Sort by creation date
- `PollSortBy.TITLE` - Sort alphabetically by title
- `PollSortBy.START_DATE` - Sort by voting start date
- `PollSortBy.END_DATE` - Sort by voting end date

#### Options

```tsx
useVotingPoolsFilters({
  history: 'push',    // 'push' | 'replace' - Navigation mode
  shallow: false      // boolean - Use shallow routing
})
```

### `useVotingPools`

A hook for fetching voting pools with infinite scroll support. It uses `useVotingPoolsFilters` internally for state management.

#### Usage

```tsx
import { useVotingPools } from './hooks/use-voting-pools';

function VotingPoolsList() {
  const {
    polls,              // Array of voting pool cards
    isLoading,          // Initial loading state
    isFetching,         // Fetching state (including pagination)
    isError,            // Error state
    error,              // Error object
    hasNextPage,        // Has more pages to load
    fetchNextPage,      // Load next page function
    isFetchingNextPage, // Loading next page state
    totalPolls,         // Total number of polls
    filters             // Current filter state
  } = useVotingPools();

  return (
    <div>
      {polls.map(poll => <PollCard key={poll.id} {...poll} />)}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  );
}
```

## Architecture Benefits

### Before (Duplicated State)
```
VotingPoolsFilters -> useQueryStates()
useVotingPools -> useQueryStates()
```
❌ Duplicated logic
❌ Hard to maintain
❌ Risk of inconsistency

### After (Centralized State)
```
useVotingPoolsFilters -> useQueryStates()
    ↓
VotingPoolsFilters
useVotingPools
```
✅ Single source of truth
✅ Easy to maintain
✅ Consistent behavior
✅ Reusable across components

## Examples

### Debounced Search Input

```tsx
import { useEffect, useState } from 'react';
import { useDebounce } from 'rooks';
import { useVotingPoolsFilters } from './hooks';

function SearchInput() {
  const { filters, setFilters } = useVotingPoolsFilters();
  const [searchInput, setSearchInput] = useState(filters.q);

  const debouncedSetSearch = useDebounce((value: string) => {
    setFilters({ q: value });
  }, 500);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  const handleChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  return (
    <input 
      value={searchInput} 
      onChange={(e) => handleChange(e.target.value)} 
    />
  );
}
```

### Sort Dropdown

```tsx
import { useVotingPoolsFilters } from './hooks';
import { PollSortBy } from '~/lib/api/poll/poll.interface';

function SortDropdown() {
  const { filters, setFilters } = useVotingPoolsFilters();

  return (
    <select
      value={filters.sortBy}
      onChange={(e) => setFilters({ sortBy: e.target.value as PollSortBy })}
    >
      <option value={PollSortBy.CREATED_AT}>Created Date</option>
      <option value={PollSortBy.TITLE}>Title</option>
      <option value={PollSortBy.START_DATE}>Start Date</option>
      <option value={PollSortBy.END_DATE}>End Date</option>
    </select>
  );
}
```

### Active Filter Toggle

```tsx
import { useVotingPoolsFilters } from './hooks';

function ActiveToggle() {
  const { filters, setFilters } = useVotingPoolsFilters();

  return (
    <Switch
      checked={filters.isActive}
      onCheckedChange={(checked) => setFilters({ isActive: checked })}
    />
  );
}
```

## URL Format

Filters are stored in URL search parameters:

```
/dashboard/voting-pools?q=governance&sortBy=title&order=asc&isActive=true&limit=9
```

This allows:
- ✅ Direct URL sharing with filters
- ✅ Browser back/forward navigation
- ✅ Bookmark with active filters
- ✅ Deep linking to filtered views

