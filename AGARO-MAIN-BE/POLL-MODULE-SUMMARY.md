# Poll Module - Implementation Summary

## Overview
The Poll module has been completely generated with entities, repositories, use cases, DTOs, and controllers based on the provided database schema.

## Architecture

### Domain Layer

#### Entities (3)

1. **Poll Entity** (`poll.entity.ts`)
   - Fields:
     - `title`: string (255)
     - `description`: text (nullable)
     - `isPrivate`: boolean
     - `startDate`: timestamp
     - `endDate`: timestamp
     - `creatorWalletAddress`: string (255)
     - `poolHash`: string (255, unique) - Web3 term
     - `transactionStatus`: enum (success|failed)
     - `isActive`: boolean
   - Relationships:
     - One-to-Many with PollChoice (cascade delete)
     - One-to-Many with PollAddress (cascade delete)
   - Indexes:
     - `creatorWalletAddress`
     - `isActive`
     - `isPrivate`
   - Domain Methods:
     - `isOngoing()`: Check if poll is currently active and within date range
     - `hasStarted()`: Check if poll has started
     - `hasEnded()`: Check if poll has ended
     - `validateDates()`: Validate start date is before end date
     - `canVote(walletAddress)`: Check if wallet can vote
     - `isCreator(walletAddress)`: Check if wallet is poll creator

2. **PollChoice Entity** (`poll-choice.entity.ts`)
   - Fields:
     - `pollId`: uuid
     - `choiceText`: string (500)
   - Relationships:
     - Many-to-One with Poll
   - Indexes:
     - `pollId`

3. **PollAddress Entity** (`poll-address.entity.ts`)
   - Fields:
     - `pollId`: uuid
     - `walletAddress`: string (255)
   - Relationships:
     - Many-to-One with Poll
   - Indexes:
     - `pollId`
     - `walletAddress`

#### Repositories (3 interfaces + 3 implementations)

1. **IPollRepository** / **TypeORMPollRepository**
   - Standard CRUD operations
   - Custom methods:
     - `findByPoolHash(poolHash)`: Find poll by pool hash
     - `findByCreatorWallet(walletAddress)`: Find all polls by creator
     - `findActivePolls()`: Find all active polls
     - `findOngoingPolls()`: Find polls currently running
     - `findWithRelations(id)`: Find poll with choices and addresses

2. **IPollChoiceRepository** / **TypeORMPollChoiceRepository**
   - Standard CRUD operations
   - Custom methods:
     - `findByPollId(pollId)`: Find all choices for a poll
     - `deleteByPollId(pollId)`: Delete all choices for a poll
     - `createMany(choices)`: Bulk create choices

3. **IPollAddressRepository** / **TypeORMPollAddressRepository**
   - Standard CRUD operations
   - Custom methods:
     - `findByPollId(pollId)`: Find all addresses for a poll
     - `findByWalletAddress(walletAddress)`: Find all polls a wallet is invited to
     - `deleteByPollId(pollId)`: Delete all addresses for a poll
     - `createMany(addresses)`: Bulk create addresses
     - `isWalletAllowed(pollId, walletAddress)`: Check if wallet is allowed

### Application Layer

#### DTOs (3)

1. **CreatePollDto**
   - Validates all required fields
   - Nested validation for choices (min 2 required)
   - Optional addresses array
   - Date validation via `@IsDateString()`

2. **UpdatePollDto**
   - All fields optional
   - Same validation rules as CreatePollDto

3. **PollResponseDto**
   - Includes computed properties (isOngoing, hasStarted, hasEnded)
   - Can optionally include relations (choices, addresses)
   - Static `fromEntity()` method for mapping

#### Use Cases (9)

1. **CreatePollUseCase**
   - Validates pool hash uniqueness
   - Validates start date < end date
   - Creates poll with choices and addresses in one transaction
   - Returns poll with all relations

2. **GetPollByIdUseCase**
   - Fetches poll with all relations
   - Throws NotFoundException if not found

3. **GetAllPollsUseCase**
   - Returns all polls (without relations for performance)

4. **GetActivePollsUseCase**
   - Returns only active polls with relations

5. **GetOngoingPollsUseCase**
   - Returns polls that are currently running
   - Filters by: isActive, date range, transaction status

6. **GetPollsByCreatorUseCase**
   - Returns all polls created by a specific wallet
   - Includes relations

7. **UpdatePollUseCase**
   - Validates dates if either is updated
   - Throws NotFoundException if poll doesn't exist

8. **DeletePollUseCase**
   - Soft delete (via BaseEntity)
   - Cascade deletes choices and addresses
   - Throws NotFoundException if poll doesn't exist

9. **CheckVotingEligibilityUseCase**
   - Checks if a wallet can vote in a poll
   - Returns reason if not eligible
   - Considers: poll status, private flag, address whitelist

### Presentation Layer

#### Controller (1)

**PollController** (`/api/polls`)

Endpoints:
- `POST /polls` - Create new poll
- `GET /polls` - Get all polls
- `GET /polls/active` - Get active polls
- `GET /polls/ongoing` - Get ongoing polls
- `GET /polls/creator/:walletAddress` - Get polls by creator
- `GET /polls/:id` - Get poll by ID (with relations)
- `GET /polls/:id/eligibility?walletAddress=xxx` - Check voting eligibility
- `PUT /polls/:id` - Update poll
- `DELETE /polls/:id` - Delete poll (soft delete)

### Module Configuration

**PollModule** registers:
- 3 entities in TypeORM
- 3 repository providers
- 9 use case providers
- 1 controller
- Exports all repositories for use in other modules

## Key Features

### 1. Date Validation
- Start date must be before end date
- Validated at both creation and update
- Computed methods to check poll status

### 2. Access Control
- `isPrivate`: Only shows poll to creator
- `addresses`: Whitelist of wallets allowed to vote
- Separate concerns: private vs invited

### 3. Web3 Integration
- `poolHash`: Unique identifier from blockchain
- `transactionStatus`: Track blockchain transaction
- `walletAddress`: Creator identification

### 4. Cascade Operations
- Deleting a poll automatically deletes choices and addresses
- Atomic operations for data consistency

### 5. Soft Deletes
- All entities extend BaseEntity with soft delete support
- Data retained for audit/recovery

### 6. Performance Optimizations
- Indexes on frequently queried fields
- Optional relation loading
- Bulk operations for choices and addresses

## Database Schema

```sql
-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  creator_wallet_address VARCHAR(255) NOT NULL,
  pool_hash VARCHAR(255) UNIQUE NOT NULL,
  transaction_status ENUM('success', 'failed') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  INDEX idx_creator_wallet (creator_wallet_address),
  INDEX idx_is_active (is_active),
  INDEX idx_is_private (is_private)
);

-- Poll Choices table
CREATE TABLE poll_choices (
  id UUID PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  choice_text VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  INDEX idx_poll_id (poll_id)
);

-- Poll Addresses table
CREATE TABLE poll_addresses (
  id UUID PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  INDEX idx_poll_id (poll_id),
  INDEX idx_wallet_address (wallet_address)
);
```

## Example Usage

### Creating a Poll

```typescript
POST /api/polls
{
  "title": "Choose Next Feature",
  "description": "Vote for the next feature to implement",
  "isPrivate": false,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "creatorWalletAddress": "0x1234...5678",
  "poolHash": "abc123def456",
  "transactionStatus": "success",
  "isActive": true,
  "choices": [
    { "choiceText": "Dark Mode" },
    { "choiceText": "Mobile App" },
    { "choiceText": "API Integration" }
  ],
  "addresses": [
    { "walletAddress": "0xaaaa...bbbb" },
    { "walletAddress": "0xcccc...dddd" }
  ]
}
```

### Checking Eligibility

```typescript
GET /api/polls/{pollId}/eligibility?walletAddress=0x1234...5678

Response:
{
  "eligible": true
}
// or
{
  "eligible": false,
  "reason": "Your wallet address is not authorized to vote in this poll"
}
```

## Next Steps

1. **Generate Database Migration**
   ```bash
   npm run migration:generate -- src/database/migrations/CreatePollTables
   ```

2. **Run Migration**
   ```bash
   npm run migration:run
   ```

3. **Test the API**
   - Use Postman/Insomnia to test endpoints
   - Verify cascade deletes work correctly
   - Test date validation

4. **Add Vote Module** (Future)
   - Create Vote entity
   - Link to Poll and PollChoice
   - Track wallet addresses that voted
   - Prevent duplicate votes

## Notes

- `pool_hash` is kept as-is (Web3 terminology)
- All dates are stored as UTC timestamps
- Soft delete is enabled on all entities
- Repository pattern allows easy testing and mocking
- Clean Architecture principles maintained throughout

