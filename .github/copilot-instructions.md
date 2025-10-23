# AgaroVote - AI Coding Agent Instructions

## Project Overview

AgaroVote is a **Web3 decentralized voting platform** with blockchain-verified data integrity. It's a **monorepo** with 5 specialized components that communicate through blockchain events and REST APIs.

## Architecture & Components

### 1. **AGARO-CONTRACT** (Solidity Smart Contracts)

- Hardhat 3.0 project with OpenZeppelin upgradeable contracts
- Key contracts: `EntryPoint`, `VotingPoll`, `SyntheticReward`, `MerkleTree`, `ERC20-AGR`
- **Generate TypeScript types**: `yarn wagmi` (required after any contract changes)
- **Deployment**: Use Ignition modules in `ignition/modules/`
- **Local testing**: `yarn node` (starts Anvil), then deploy with `yarn ignition:entrypoint:local`

### 2. **AGARO-MAIN-BE** (NestJS Backend)

- **Architecture**: Domain-Driven Design (DDD) with strict layer separation
- **4 Layers**: Domain (entities, interfaces) → Application (use cases, DTOs) → Infrastructure (TypeORM repos) → Presentation (controllers)
- **Authentication**: SIWE (Sign-In With Ethereum) + JWT - ALL routes protected by default
- **Module structure**: `auth/`, `poll/`, `vote/`, `reward/`, `user/`, `dashboard/`

#### Critical Patterns:

- **Public routes**: Use `@Public()` decorator to bypass auth
- **Protected routes**: Inject wallet with `@Wallet() walletAddress: string` decorator
- **Repository pattern**: Always implement `I<Entity>Repository` interface first, then TypeORM implementation
- **Generate new modules**: `yarn generate:crud <module> <entity>` (creates full DDD structure + auto-injects into app.module.ts)

#### Key Commands:

```bash
yarn start:dev              # Development server (hot reload)
yarn migration:generate     # Generate migration from entity changes
yarn migration:run          # Run pending migrations
yarn generate:crud poll poll  # Generate complete DDD CRUD module
```

### 3. **AGARO-MAIN-FE** (React 19 + React Router 7)

- **Routing**: React Router 7 with type-safe routes (`routes.ts`)
- **Web3**: Wagmi v2 + Viem for blockchain interactions
- **State**: TanStack Query v5 with persistence (localStorage + indexedDB)
- **UI**: Radix UI + Shadcn + TailwindCSS v4
- **Authentication**: SIWE flow in `/auth/siwe.tsx` resource route, cookie-based JWT

#### Critical Patterns:

- **Contract integration**: Auto-generated types in `app/lib/web3/contracts/generated.ts` via Wagmi CLI
- **Protected routes**: Use `app/lib/middleware/siwe-auth-middleware.ts` in `loader` functions
- **API calls**: Use `app/lib/api/authenticated-client.ts` (auto-injects JWT from cookies)
- **Forms**: TanStack Form + inline validators (no Zod schemas in forms, use validation functions)
- **Optimistic updates**: Use `useOptimisticMutation` hook from `app/hooks/use-optimistic-mutation.ts`

#### Key Commands:

```bash
yarn dev                    # Development server
yarn contracts:generate     # Compile contracts + generate Wagmi types
yarn wagmi:watch           # Watch mode for contract type generation
```

### 4. **AGARO-EVENT-LISTENER** (Rust)

- Listens to blockchain events from `EntryPoint` contract
- Sends events to backend API endpoints for off-chain storage
- Uses `ethers-rs` library with event streams

### 5. **AGARO-LANDING-PAGE-FE** (Marketing Site)

- Vite + React standalone project
- Separate deployment from main app

## Cross-Component Workflows

### Smart Contract → Frontend Integration

1. Update contract in `AGARO-CONTRACT/contracts/`
2. Compile: `cd AGARO-CONTRACT && yarn compile`
3. Generate types: `cd AGARO-MAIN-FE && yarn wagmi`
4. Use generated hooks: `useReadEntryPoint...`, `useWriteEntryPoint...`

### Backend Module Creation (DDD)

**Always use the generator** to maintain consistency:

```bash
cd AGARO-MAIN-BE
yarn generate:crud <module-name> <entity-name>
```

This creates:

- Domain layer: `entities/`, `repositories/` (interfaces)
- Application layer: `dto/`, `use-cases/`
- Infrastructure layer: `repositories/` (TypeORM implementation)
- Presentation layer: `controllers/`
- Auto-injects module into `app.module.ts`

### Authentication Flow

1. **Frontend**: User connects wallet → calls `/auth/siwe?walletAddress=...` (GET) to get nonce
2. **Frontend**: Signs SIWE message with wallet → POST to `/auth/siwe` with signature
3. **Backend**: Verifies signature, generates JWT, sets httpOnly cookie
4. **Frontend**: All API calls auto-include JWT via `authenticated-client.ts`
5. **Backend**: `JwtAuthGuard` validates JWT on all routes (unless `@Public()`)

## Project-Specific Conventions

### Backend (NestJS)

- **NO business logic in controllers** - controllers only route to use cases
- **Repository interfaces in domain layer** - implementations in infrastructure
- **Use cases are single-purpose** - one use case = one business operation
- **Always validate wallet ownership**: `if (dto.walletAddress !== walletAddress) throw ForbiddenException`
- **Migrations required** - never use `synchronize: true` in TypeORM config

### Frontend (React Router 7)

- **No default exports** - always use named exports
- **Server functions** end with `.server.ts` - only run on server
- **Resource routes** for API endpoints: `routes/auth.siwe.tsx` pattern
- **Middleware in loaders**: Protect routes by calling `requireAuth(request)` in loader
- **Cookie-based auth**: Use `getAuthFromCookie()`, never localStorage for JWT
- **Type generation**: Run `yarn tsc` after route changes to update types

### Smart Contracts

- **Upgradeable pattern**: Use OpenZeppelin upgradeable contracts (UUPS)
- **MerkleTree for whitelisting**: Generate off-chain, verify on-chain
- **Events are critical**: Every state change must emit event for event-listener
- **Gas optimization**: Batch operations when possible (e.g., reward distributions)

## Environment Setup

### Required Services (Docker Compose)

```bash
cd AGARO-DEPENDENCIES
docker compose up -d  # Starts PostgreSQL + Adminer + Anvil (local blockchain)
```

### Environment Variables

- **Backend**: `.env` with `JWT_SECRET`, `DATABASE_URL`, `RPC_URL`
- **Frontend**: `.env` with `VITE_WALLETCONNECT_PROJECT_ID`, `VITE_API_BASE_URL`
- **Contracts**: `.env` with `SEPOLIA_PRIVATE_KEY`, `ETHERSCAN_API_KEY`

## Testing & Debugging

### Backend

```bash
yarn test              # Unit tests
yarn test:e2e          # E2E tests
yarn start:debug       # Debug mode (port 9229)
```

### Frontend

- React DevTools + TanStack Query DevTools (embedded)
- Check `Network` tab for API calls with JWT in `Authorization` header

### Contracts

```bash
yarn test              # Hardhat tests (Mocha)
yarn node              # Local Anvil node (port 8545)
```

## Critical "Gotchas"

1. **Backend routes protected by default** - Always add `@Public()` for open endpoints
2. **Wagmi types must be regenerated** after contract changes - frontend won't compile otherwise
3. **TypeORM migrations required** - Entity changes need migrations, never auto-sync in production
4. **Cookie domain matters** - SIWE auth uses httpOnly cookies, must match frontend domain
5. **Wallet address casing** - Always use `.toLowerCase()` when comparing addresses
6. **React Router 7 is NOT React Router 6** - Uses `loader`/`action` pattern, not `useEffect` for data fetching
7. **TanStack Form validation** - Use inline validators, NOT Zod schemas (performance optimization)

## Documentation References

- Backend Architecture: `AGARO-MAIN-BE/04-ARCHITECTURE.md`
- Module Generation: `AGARO-MAIN-BE/06-MODULE-GENERATION.md`
- Authentication Guide: `AGARO-MAIN-BE/AUTHENTICATION_GUIDE.md`
- Frontend Developer Guide: `AGARO-MAIN-FE/docs/DEVELOPER_GUIDE.md`
- Smart Contract Guide: `AGARO-MAIN-FE/SMART_CONTRACT_GUIDE.md`

## Key Design Decisions

- **Why DDD?** - Complex business logic benefits from domain modeling and clear boundaries
- **Why SIWE?** - No passwords needed, cryptographic proof of wallet ownership
- **Why React Router 7?** - Native SSR support, modern data loading patterns, better UX
- **Why monorepo?** - Tight coupling between contracts, backend, and frontend requires coordinated changes
- **Why event-listener in Rust?** - Performance for high-volume blockchain event processing
