# Poll Module - Pagination Guide

## Overview
All list endpoints in the Poll module now support pagination, filtering, sorting, and search capabilities.

## API Endpoints with Pagination

### 1. **GET /api/polls** - Get All Polls (Paginated)
Returns a paginated list of all polls with filtering and sorting options.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 300) - Items per page
- `sortBy` (optional, default: `createdAt`) - Sort field
  - Options: `createdAt`, `title`, `startDate`, `endDate`
- `order` (optional, default: `DESC`) - Sort order
  - Options: `ASC`, `DESC`
- `q` (optional) - Search query (searches in title and description)
- `transactionStatus` (optional) - Filter by transaction status
  - Options: `success`, `failed`
- `isPrivate` (optional) - Filter by privacy
  - Options: `true`, `false`
- `isActive` (optional) - Filter by active status
  - Options: `true`, `false`

**Example Request:**
```bash
GET /api/polls?page=1&limit=20&sortBy=startDate&order=DESC&q=vote&transactionStatus=success&isActive=true
```

**Response Format:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Poll Title",
      "description": "Description",
      "isPrivate": false,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z",
      "creatorWalletAddress": "0x123...",
      "poolHash": "abc123",
      "transactionStatus": "success",
      "isActive": true,
      "choices": [
        {
          "id": "uuid",
          "pollId": "uuid",
          "choiceText": "Option 1",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "addresses": [
        {
          "id": "uuid",
          "pollId": "uuid",
          "walletAddress": "0x456...",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "isOngoing": true,
      "hasStarted": true,
      "hasEnded": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2. **GET /api/polls/active** - Get Active Polls (Paginated)
Returns only active polls with all pagination features.

**Query Parameters:** Same as above

**Example Request:**
```bash
GET /api/polls/active?page=1&limit=10&sortBy=createdAt&order=DESC
```

**Response Format:** Same as above

### 3. **GET /api/polls/ongoing** - Get Ongoing Polls (Paginated)
Returns polls that are currently running (within date range, active, and successful transaction).

**Query Parameters:** Same as above

**Example Request:**
```bash
GET /api/polls/ongoing?page=1&limit=10&q=election
```

**Response Format:** Same as above

### 4. **GET /api/polls/creator/:walletAddress** - Get Polls by Creator (Paginated)
Returns all polls created by a specific wallet address.

**Path Parameters:**
- `walletAddress` (required) - Creator's wallet address

**Query Parameters:** Same as above

**Example Request:**
```bash
GET /api/polls/creator/0x1234567890abcdef?page=1&limit=10&sortBy=startDate&order=ASC
```

**Response Format:** Same as above

## Query Parameter Details

### Pagination
- **page**: Page number starting from 1
- **limit**: Number of items per page (1-300)

### Sorting
- **sortBy**: Field to sort by
  - `createdAt` - Sort by creation date (default)
  - `title` - Sort alphabetically by title
  - `startDate` - Sort by poll start date
  - `endDate` - Sort by poll end date
- **order**: Sort direction
  - `DESC` - Descending (newest/highest first) - default
  - `ASC` - Ascending (oldest/lowest first)

### Filtering
- **q**: Search term for full-text search
  - Searches in: `title`, `description`
  - Case-insensitive
  - Example: `q=community` finds "Community Vote", "Vote for community", etc.

- **transactionStatus**: Filter by blockchain transaction status
  - `success` - Only successful transactions
  - `failed` - Only failed transactions

- **isPrivate**: Filter by privacy setting
  - `true` - Only private polls
  - `false` - Only public polls

- **isActive**: Filter by active status
  - `true` - Only active polls
  - `false` - Only inactive polls

## Usage Examples

### Example 1: Get First Page with Default Settings
```bash
GET /api/polls
```
Returns first 10 polls, sorted by creation date (newest first).

### Example 2: Search for Polls
```bash
GET /api/polls?q=governance&page=1&limit=20
```
Search for polls containing "governance" in title or description.

### Example 3: Get Recent Active Polls
```bash
GET /api/polls/active?page=1&limit=50&sortBy=createdAt&order=DESC
```
Get the 50 most recently created active polls.

### Example 4: Get Upcoming Polls
```bash
GET /api/polls?sortBy=startDate&order=ASC&isActive=true
```
Get active polls sorted by start date (earliest first).

### Example 5: Complex Filtering
```bash
GET /api/polls?page=2&limit=25&q=vote&transactionStatus=success&isPrivate=false&isActive=true&sortBy=startDate&order=DESC
```
- Page 2 with 25 items
- Search for "vote"
- Only successful transactions
- Only public polls
- Only active polls
- Sort by start date (newest first)

### Example 6: Get Creator's Polls
```bash
GET /api/polls/creator/0x1234567890abcdef?page=1&limit=10&sortBy=endDate&order=DESC
```
Get polls created by specific wallet, sorted by end date.

## Response Metadata

The `meta` object in the response contains:
- **page**: Current page number
- **limit**: Items per page
- **total**: Total number of items matching filters
- **totalPages**: Total number of pages

Use this to build pagination UI:
```javascript
const { page, limit, total, totalPages } = response.meta;

const hasNextPage = page < totalPages;
const hasPreviousPage = page > 1;
const nextPage = page + 1;
const previousPage = page - 1;
```

## Relations Included

All paginated list endpoints include:
- ✅ **choices** - All poll options
- ✅ **addresses** - Allowed wallet addresses (for invite-only polls)

Single poll endpoint (`GET /api/polls/:id`) also includes these relations.

## Performance Considerations

### Database Indexes
The following indexes are created for optimal performance:
- `creator_wallet_address`
- `is_active`
- `is_private`
- `poll_id` (on choices and addresses)
- `wallet_address` (on addresses)

### Query Optimization
- Relations are loaded using `leftJoinAndSelect` for efficiency
- Sorting uses indexed columns when possible
- Search uses ILIKE for case-insensitive matching

### Recommended Limits
- Default: 10 items per page
- Maximum: 300 items per page
- For mobile apps: Use 20-50 items per page
- For web dashboards: Use 10-25 items per page

## Error Handling

### Invalid Parameters
```json
{
  "statusCode": 400,
  "message": [
    "limit must not be greater than 300",
    "page must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Validation Errors
All query parameters are validated using `class-validator`:
- `page`: Must be integer >= 1
- `limit`: Must be integer between 1 and 300
- `sortBy`: Must be one of allowed values
- `order`: Must be ASC or DESC
- `isPrivate`/`isActive`: Must be boolean
- `transactionStatus`: Must be valid enum value

## Client Implementation Examples

### JavaScript/TypeScript
```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchPolls(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  q?: string;
  transactionStatus?: string;
  isPrivate?: boolean;
  isActive?: boolean;
}): Promise<PaginatedResponse<Poll>> {
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  const response = await fetch(`/api/polls?${queryString}`);
  return response.json();
}

// Usage
const result = await fetchPolls({
  page: 1,
  limit: 20,
  q: 'governance',
  isActive: true,
  sortBy: 'startDate',
  order: 'DESC'
});
```

### React Hook Example
```typescript
import { useState, useEffect } from 'react';

function usePolls(filters: PollFilters) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPolls() {
      setLoading(true);
      const result = await fetchPolls(filters);
      setData(result.data);
      setMeta(result.meta);
      setLoading(false);
    }
    loadPolls();
  }, [filters]);

  return { data, meta, loading };
}
```

## Testing

### Test Cases Covered
1. ✅ Basic pagination (page, limit)
2. ✅ Sorting (all fields, both orders)
3. ✅ Search functionality
4. ✅ Transaction status filtering
5. ✅ Privacy filtering
6. ✅ Active status filtering
7. ✅ Combined filters
8. ✅ Edge cases (page out of range, invalid params)
9. ✅ Empty results
10. ✅ Relations loading

### Sample Test with cURL
```bash
# Test basic pagination
curl "http://localhost:3000/api/polls?page=1&limit=10"

# Test search
curl "http://localhost:3000/api/polls?q=vote"

# Test filtering
curl "http://localhost:3000/api/polls?isActive=true&transactionStatus=success"

# Test sorting
curl "http://localhost:3000/api/polls?sortBy=startDate&order=ASC"

# Test combined
curl "http://localhost:3000/api/polls?page=2&limit=20&q=governance&isActive=true&sortBy=createdAt&order=DESC"
```

## Migration from Old Endpoints

If you were using the old non-paginated endpoints:

**Before:**
```typescript
GET /api/polls
// Returns: Poll[]
```

**After:**
```typescript
GET /api/polls
// Returns: { data: Poll[], meta: { ... } }
```

**Migration:**
```typescript
// Old code
const polls = await fetch('/api/polls').then(r => r.json());

// New code
const { data: polls, meta } = await fetch('/api/polls').then(r => r.json());
```

## Future Enhancements

Potential improvements:
- [ ] Add cursor-based pagination for very large datasets
- [ ] Add date range filtering (startDate/endDate)
- [ ] Add creator wallet filtering in main list
- [ ] Add bookmark/favorite filtering
- [ ] Add vote count filtering
- [ ] Cache frequently accessed pages
- [ ] Add GraphQL support for flexible queries

