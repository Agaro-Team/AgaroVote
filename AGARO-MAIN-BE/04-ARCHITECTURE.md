# Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [DDD Layers](#ddd-layers)
3. [Module Structure](#module-structure)
4. [Data Flow](#data-flow)
5. [Design Patterns](#design-patterns)
6. [Best Practices](#best-practices)

## Overview

This application follows **Domain-Driven Design (DDD)** principles with a **modular monolith** architecture. Each module is organized into distinct layers, ensuring clear separation of concerns and maintainability.

## DDD Layers

### 1. Domain Layer (Core Business Logic)

**Purpose**: Contains the heart of the business logic.

**Components**:
- **Entities**: Business objects with identity
- **Value Objects**: Immutable objects without identity
- **Domain Services**: Business logic that doesn't fit in entities
- **Repository Interfaces**: Contracts for data access

**Rules**:
- ✅ No framework dependencies
- ✅ Pure TypeScript/JavaScript
- ✅ Contains business rules and validations
- ❌ No infrastructure concerns
- ❌ No HTTP/database logic

**Example**:
```typescript
// user.entity.ts
@Entity('users')
export class User extends BaseEntity {
  @Column()
  email: string;

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}
```

### 2. Application Layer (Use Cases)

**Purpose**: Orchestrates business workflows and use cases.

**Components**:
- **Use Cases**: Application-specific business rules
- **DTOs**: Data transfer objects for input/output
- **Application Services**: Coordinate domain objects

**Rules**:
- ✅ Implements use cases
- ✅ Orchestrates domain objects
- ✅ Independent of delivery mechanism
- ❌ No HTTP-specific code
- ❌ No database implementation details

**Example**:
```typescript
// create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  async execute(dto: CreateUserDto): Promise<User> {
    // Validate
    // Transform
    // Call domain
    // Return result
  }
}
```

### 3. Infrastructure Layer (External Concerns)

**Purpose**: Implements interfaces defined by domain layer.

**Components**:
- **Repository Implementations**: Database access
- **External Services**: Third-party APIs
- **File System**: File operations
- **Message Queues**: Event handling

**Rules**:
- ✅ Implements domain interfaces
- ✅ Contains framework-specific code
- ✅ Handles external system integration
- ❌ No business logic

**Example**:
```typescript
// typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }
}
```

### 4. Presentation Layer (API/UI)

**Purpose**: Handles HTTP requests and responses.

**Components**:
- **Controllers**: HTTP endpoints
- **Middlewares**: Request processing
- **Guards**: Authorization
- **Interceptors**: Response transformation

**Rules**:
- ✅ Handles HTTP concerns
- ✅ Validates requests
- ✅ Transforms responses
- ❌ No business logic
- ❌ No direct database access

**Example**:
```typescript
// user.controller.ts
@Controller('users')
export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }
}
```

## Module Structure

Each feature module follows this structure:

```
modules/
└── user/
    ├── domain/
    │   ├── entities/
    │   │   └── user.entity.ts
    │   └── repositories/
    │       └── user-repository.interface.ts
    │
    ├── application/
    │   ├── dto/
    │   │   ├── create-user.dto.ts
    │   │   ├── update-user.dto.ts
    │   │   └── user-response.dto.ts
    │   └── use-cases/
    │       ├── create-user.use-case.ts
    │       ├── get-user-by-id.use-case.ts
    │       └── update-user.use-case.ts
    │
    ├── infrastructure/
    │   └── repositories/
    │       └── typeorm-user.repository.ts
    │
    ├── presentation/
    │   └── controllers/
    │       └── user.controller.ts
    │
    └── user.module.ts
```

## Data Flow

### Request Flow

```
Client Request
    ↓
[Presentation Layer]
    ↓ (HTTP Request)
Controller validates request
    ↓
Controller calls Use Case
    ↓
[Application Layer]
    ↓ (DTO)
Use Case orchestrates business logic
    ↓
Use Case calls Domain methods
    ↓
[Domain Layer]
    ↓ (Domain Models)
Business rules executed
    ↓
Domain calls Repository Interface
    ↓
[Infrastructure Layer]
    ↓ (Database Query)
Repository Implementation executes query
    ↓
Database returns data
    ↓
[Response Flow - Reversed]
    ↓
Repository → Domain → Application → Presentation
    ↓
Client Response
```

### Dependency Direction

```
Presentation
    ↓ (depends on)
Application
    ↓ (depends on)
Domain
    ↑ (implements)
Infrastructure
```

**Key Principle**: Inner layers don't depend on outer layers. Infrastructure implements interfaces defined in Domain.

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstracts data access logic.

```typescript
// Interface (Domain Layer)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

// Implementation (Infrastructure Layer)
export class TypeOrmUserRepository implements IUserRepository {
  // Database-specific implementation
}
```

### 2. Dependency Injection

**Purpose**: Loose coupling and testability.

```typescript
@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UserModule {}
```

### 3. DTO Pattern

**Purpose**: Data validation and transformation.

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
```

### 4. Use Case Pattern

**Purpose**: Encapsulates business workflows.

```typescript
export class CreateUserUseCase {
  async execute(dto: CreateUserDto): Promise<User> {
    // Single responsibility: Create user
  }
}
```

## Best Practices

### 1. Separation of Concerns

✅ **DO**:
```typescript
// Controller - only HTTP concerns
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.createUserUseCase.execute(dto);
}

// Use Case - business logic
async execute(dto: CreateUserDto) {
  const exists = await this.repository.findByEmail(dto.email);
  if (exists) throw new ConflictException();
  return this.repository.create(dto);
}
```

❌ **DON'T**:
```typescript
// Controller with business logic
@Post()
async create(@Body() dto: CreateUserDto) {
  const exists = await this.repository.findByEmail(dto.email);
  if (exists) throw new ConflictException();
  return this.repository.create(dto);
}
```

### 2. Dependency Inversion

✅ **DO**:
```typescript
// Depend on abstractions
constructor(
  @Inject(USER_REPOSITORY)
  private repository: IUserRepository
) {}
```

❌ **DON'T**:
```typescript
// Depend on concrete implementations
constructor(
  private repository: TypeOrmUserRepository
) {}
```

### 3. Single Responsibility

✅ **DO**:
```typescript
// One use case per class
export class CreateUserUseCase { }
export class UpdateUserUseCase { }
export class DeleteUserUseCase { }
```

❌ **DON'T**:
```typescript
// Multiple responsibilities
export class UserService {
  create() {}
  update() {}
  delete() {}
  sendEmail() {}
  validateData() {}
}
```

### 4. Domain Logic in Entities

✅ **DO**:
```typescript
@Entity()
export class User {
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  canVote(): boolean {
    return this.isActive() && this.age >= 18;
  }
}
```

❌ **DON'T**:
```typescript
// Business logic in service
export class UserService {
  isActive(user: User): boolean {
    return user.status === UserStatus.ACTIVE;
  }
}
```

### 5. Validation at Boundaries

✅ **DO**:
```typescript
// Validate at entry point
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

### 6. Response Transformation

✅ **DO**:
```typescript
// Transform before sending response
export class UserResponseDto {
  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      // Don't expose password
    };
  }
}
```

### 7. Error Handling

✅ **DO**:
```typescript
// Use domain-specific exceptions
if (!user) {
  throw new NotFoundException('User not found');
}
```

### 8. Testing Strategy

- **Unit Tests**: Test domain logic in isolation
- **Integration Tests**: Test use cases with real repository
- **E2E Tests**: Test entire flow through HTTP

## Module Communication

### Within Same Module
Direct method calls via dependency injection.

### Between Modules

✅ **DO**:
```typescript
// Export through module
@Module({
  exports: [USER_REPOSITORY]
})

// Import module
@Module({
  imports: [UserModule]
})
```

❌ **DON'T**:
- Direct database access from another module
- Circular dependencies

## Scalability

### Vertical Scaling (Current)
- Modular monolith
- Easy to understand and develop
- Single deployment

### Horizontal Scaling (Future)
- Modules can be extracted into microservices
- Clear boundaries make this transition smooth
- No code rewrite needed

## Summary

| Layer | Responsibility | Dependencies |
|-------|---------------|--------------|
| Domain | Business logic | None |
| Application | Use cases | Domain |
| Infrastructure | Technical details | Domain (interfaces) |
| Presentation | HTTP/API | Application |

This architecture ensures:
- ✅ Maintainability
- ✅ Testability
- ✅ Scalability
- ✅ Clear boundaries
- ✅ Business logic isolation

