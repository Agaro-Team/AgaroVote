# Project Structure

This document provides a complete overview of the project's file structure and organization.

## Root Directory

```
AGARO-MAIN-BE/
├── .cursorignore           # Cursor IDE ignore patterns for legacy code
├── .env                    # Environment variables (local development)
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore patterns
├── docker-compose.yml     # Docker services configuration
├── eslint.config.mjs      # ESLint configuration
├── nest-cli.json          # NestJS CLI configuration
├── ormconfig.ts           # TypeORM CLI configuration for migrations
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tsconfig.build.json    # TypeScript build configuration
├── yarn.lock              # Yarn lock file
├── README.md              # Main documentation
├── ARCHITECTURE.md        # Architecture and DDD principles
├── SETUP.md               # Setup instructions
└── PROJECT_STRUCTURE.md   # This file
```

## Source Code (`src/`)

### Configuration Layer

```
src/config/
├── app.config.ts          # Application configuration (port, API prefix, etc.)
├── database.config.ts     # Database configuration
└── config.module.ts       # Configuration module (Global)
```

**Purpose:** Centralized configuration management using `@nestjs/config`.

### Shared/Common Layer

```
src/shared/
├── domain/                 # Shared domain logic
│   ├── base.entity.ts     # Base entity with id, timestamps, soft delete
│   └── repository.interface.ts  # Generic repository interface
│
├── application/           # Shared application layer
│   └── dto/
│       ├── pagination.dto.ts    # Pagination query and result types
│       └── response.dto.ts      # Standard API response wrapper
│
├── infrastructure/        # Shared infrastructure
│   └── database/
│       └── database.module.ts   # TypeORM database module
│
└── presentation/          # Shared presentation layer
    ├── controllers/
    │   └── health.controller.ts  # Health check endpoints
    ├── filters/
    │   └── http-exception.filter.ts  # Global exception handler
    ├── interceptors/
    │   └── transform.interceptor.ts  # Response transformation
    └── pipes/
        └── validation.pipe.ts        # Request validation
```

**Purpose:** Reusable components used across all modules.

### Business Modules

#### User Module (Example Implementation)

```
src/modules/user/
├── domain/                        # Domain Layer (Business Logic)
│   ├── entities/
│   │   └── user.entity.ts        # User entity with business methods
│   └── repositories/
│       └── user-repository.interface.ts  # Repository contract
│
├── application/                   # Application Layer (Use Cases)
│   ├── dto/
│   │   ├── create-user.dto.ts    # Create user input validation
│   │   ├── update-user.dto.ts    # Update user input validation
│   │   └── user-response.dto.ts  # User response transformation
│   └── use-cases/
│       ├── create-user.use-case.ts      # Create user workflow
│       ├── get-user-by-id.use-case.ts   # Get single user
│       ├── get-all-users.use-case.ts    # Get all users
│       ├── update-user.use-case.ts      # Update user workflow
│       └── delete-user.use-case.ts      # Delete user workflow
│
├── infrastructure/                # Infrastructure Layer (Technical)
│   └── repositories/
│       └── typeorm-user.repository.ts  # TypeORM implementation
│
├── presentation/                  # Presentation Layer (HTTP)
│   └── controllers/
│       └── user.controller.ts    # HTTP endpoints
│
└── user.module.ts                # Module definition & dependency wiring
```

**Purpose:** Complete example of DDD module structure.

### Database

```
src/database/
└── migrations/            # TypeORM migrations
    └── .gitkeep          # Placeholder
```

**Purpose:** Database migration files for schema versioning.

### Application Root

```
src/
├── app.module.ts         # Root application module
├── app.controller.ts     # Root controller (welcome endpoint)
├── app.service.ts        # Root service
├── app.controller.spec.ts # Root controller tests
└── main.ts               # Application entry point
```

## Test Directory

```
test/
├── app.e2e-spec.ts      # End-to-end tests
└── jest-e2e.json        # E2E test configuration
```

## Build Output

```
dist/                    # Compiled JavaScript (not tracked in git)
├── main.js
└── ...
```

## Node Modules

```
node_modules/            # Dependencies (not tracked in git)
```

## Layer Responsibilities

### 1. Domain Layer (`domain/`)

**What it contains:**
- Entities with business logic
- Value objects
- Domain services
- Repository interfaces

**Rules:**
- ✅ Pure business logic
- ✅ Framework-agnostic
- ❌ No external dependencies
- ❌ No HTTP/database concerns

**Files:**
- `*.entity.ts`
- `*-repository.interface.ts`
- `*.value-object.ts`
- `*.domain-service.ts`

### 2. Application Layer (`application/`)

**What it contains:**
- Use cases (business workflows)
- DTOs (data transfer objects)
- Application services

**Rules:**
- ✅ Orchestrates domain objects
- ✅ Implements business workflows
- ❌ No HTTP-specific code
- ❌ No database implementation

**Files:**
- `*.use-case.ts`
- `*.dto.ts`
- `*.application-service.ts`

### 3. Infrastructure Layer (`infrastructure/`)

**What it contains:**
- Repository implementations
- External service integrations
- Database adapters

**Rules:**
- ✅ Implements domain interfaces
- ✅ Framework-specific code
- ✅ External system integration
- ❌ No business logic

**Files:**
- `typeorm-*.repository.ts`
- `*-adapter.ts`
- `*.client.ts`

### 4. Presentation Layer (`presentation/`)

**What it contains:**
- Controllers
- HTTP guards
- HTTP interceptors
- Request/response handling

**Rules:**
- ✅ HTTP concerns only
- ✅ Request validation
- ✅ Response formatting
- ❌ No business logic

**Files:**
- `*.controller.ts`
- `*.guard.ts`
- `*.interceptor.ts`
- `*.filter.ts`

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `*.entity.ts` | `user.entity.ts` |
| DTO | `*.dto.ts` | `create-user.dto.ts` |
| Controller | `*.controller.ts` | `user.controller.ts` |
| Service | `*.service.ts` | `user.service.ts` |
| Use Case | `*.use-case.ts` | `create-user.use-case.ts` |
| Repository Interface | `*-repository.interface.ts` | `user-repository.interface.ts` |
| Repository Implementation | `typeorm-*.repository.ts` | `typeorm-user.repository.ts` |
| Module | `*.module.ts` | `user.module.ts` |
| Guard | `*.guard.ts` | `auth.guard.ts` |
| Interceptor | `*.interceptor.ts` | `transform.interceptor.ts` |
| Filter | `*.filter.ts` | `http-exception.filter.ts` |
| Pipe | `*.pipe.ts` | `validation.pipe.ts` |
| Config | `*.config.ts` | `database.config.ts` |
| Test | `*.spec.ts` | `user.controller.spec.ts` |
| E2E Test | `*.e2e-spec.ts` | `user.e2e-spec.ts` |

## Module Template

When creating a new module, follow this structure:

```
src/modules/[module-name]/
├── domain/
│   ├── entities/
│   │   └── [entity].entity.ts
│   └── repositories/
│       └── [entity]-repository.interface.ts
├── application/
│   ├── dto/
│   │   ├── create-[entity].dto.ts
│   │   ├── update-[entity].dto.ts
│   │   └── [entity]-response.dto.ts
│   └── use-cases/
│       ├── create-[entity].use-case.ts
│       ├── get-[entity]-by-id.use-case.ts
│       ├── get-all-[entities].use-case.ts
│       ├── update-[entity].use-case.ts
│       └── delete-[entity].use-case.ts
├── infrastructure/
│   └── repositories/
│       └── typeorm-[entity].repository.ts
├── presentation/
│   └── controllers/
│       └── [entity].controller.ts
└── [module-name].module.ts
```

## Import Paths

### Absolute vs Relative

We use **relative imports** within modules:

```typescript
// Within same module
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
```

### Shared Resources

Access shared resources via relative paths:

```typescript
// From a module to shared
import { BaseEntity } from '../../../../shared/domain/base.entity';
```

## Dependency Flow

```
Presentation Layer
    ↓ (depends on)
Application Layer
    ↓ (depends on)
Domain Layer
    ↑ (implements)
Infrastructure Layer
```

**Key Principle:** 
- Inner layers (Domain) don't depend on outer layers
- Outer layers depend on inner layers
- Infrastructure implements Domain interfaces (Dependency Inversion)

## Git Ignored Files

```
# Compiled output
dist/
node_modules/

# Environment
.env
.env.local

# Logs
*.log

# OS
.DS_Store

# IDE
.vscode/
.idea/

# Coverage
coverage/
```

## Important Files Overview

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `tsconfig.json` | TypeScript compiler options |
| `nest-cli.json` | NestJS CLI configuration |
| `ormconfig.ts` | TypeORM CLI configuration |
| `.env` | Local environment variables |
| `docker-compose.yml` | Local PostgreSQL setup |
| `README.md` | Getting started guide |
| `ARCHITECTURE.md` | DDD principles and patterns |
| `SETUP.md` | Detailed setup instructions |

## Build Output Structure

After running `yarn build`, the `dist/` directory contains:

```
dist/
├── config/
├── modules/
├── shared/
├── database/
├── main.js
├── app.module.js
└── ...
```

## Environment Files

| File | Purpose | Tracked in Git? |
|------|---------|----------------|
| `.env` | Local development | ❌ No |
| `.env.example` | Template | ✅ Yes |
| `.env.local` | Personal overrides | ❌ No |
| `.env.production` | Production (on server) | ❌ No |

## Scripts Overview

| Script | Purpose |
|--------|---------|
| `yarn start:dev` | Development with hot reload |
| `yarn build` | Compile TypeScript to JavaScript |
| `yarn start:prod` | Run production build |
| `yarn lint` | Lint code |
| `yarn format` | Format code |
| `yarn test` | Run unit tests |
| `yarn test:e2e` | Run E2E tests |
| `yarn migration:generate` | Generate migration from entities |
| `yarn migration:run` | Run pending migrations |
| `yarn migration:revert` | Revert last migration |

## Adding New Features

### 1. Create New Module

```bash
mkdir -p src/modules/my-feature/{domain/{entities,repositories},application/{dto,use-cases},infrastructure/repositories,presentation/controllers}
```

### 2. Add Files

Follow the User module as an example.

### 3. Register Module

```typescript
// app.module.ts
import { MyFeatureModule } from './modules/my-feature/my-feature.module';

@Module({
  imports: [
    // ...
    MyFeatureModule,
  ],
})
```

## Summary

This project follows a **clean architecture** approach with **Domain-Driven Design** principles:

- ✅ Clear separation of concerns
- ✅ Testable business logic
- ✅ Framework-independent domain
- ✅ Scalable and maintainable
- ✅ Easy to understand and extend

Each module is self-contained and follows the same pattern, making the codebase consistent and predictable.

