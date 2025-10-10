# AGARO Vote Backend

A modular backend application built with NestJS, TypeORM, and PostgreSQL following Domain-Driven Design (DDD) principles.

## 🏗️ Architecture

This project follows a **Domain-Driven Design (DDD)** architecture with clear separation of concerns:

```
src/
├── config/                    # Configuration management
│   ├── app.config.ts         # Application configuration
│   ├── database.config.ts    # Database configuration
│   └── config.module.ts      # Configuration module
│
├── shared/                    # Shared/Common code across modules
│   ├── domain/               # Shared domain logic
│   │   ├── base.entity.ts    # Base entity with common fields
│   │   └── repository.interface.ts
│   ├── application/          # Shared application layer
│   │   └── dto/              # Common DTOs
│   ├── infrastructure/       # Shared infrastructure
│   │   └── database/
│   └── presentation/         # Shared presentation layer
│       ├── filters/          # Exception filters
│       ├── interceptors/     # Response transformers
│       └── pipes/            # Validation pipes
│
├── modules/                  # Business modules
│   └── user/                 # Example: User module
│       ├── domain/           # Domain layer (Entities, Interfaces)
│       │   ├── entities/
│       │   └── repositories/
│       ├── application/      # Application layer (Use Cases, DTOs)
│       │   ├── dto/
│       │   └── use-cases/
│       ├── infrastructure/   # Infrastructure layer (Repository implementations)
│       │   └── repositories/
│       ├── presentation/     # Presentation layer (Controllers)
│       │   └── controllers/
│       └── user.module.ts    # Module definition
│
├── database/                 # Database migrations
│   └── migrations/
│
├── app.module.ts            # Root application module
└── main.ts                  # Application entry point
```

## 🎯 DDD Layers Explained

### 1. Domain Layer
- Contains core business logic and rules
- Defines entities, value objects, and domain services
- Independent of frameworks and external concerns
- **Files**: `*.entity.ts`, `*-repository.interface.ts`

### 2. Application Layer
- Orchestrates use cases and business workflows
- Contains DTOs (Data Transfer Objects)
- Coordinates between domain and infrastructure
- **Files**: `*.use-case.ts`, `*.dto.ts`

### 3. Infrastructure Layer
- Implements interfaces defined in domain layer
- Handles database operations, external APIs
- Contains concrete implementations
- **Files**: `typeorm-*.repository.ts`

### 4. Presentation Layer
- Handles HTTP concerns
- Contains controllers, routes, request/response handling
- **Files**: `*.controller.ts`

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AGARO-MAIN-BE
```

2. Install dependencies
```bash
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=agaro_vote_db
```

5. Create the database
```bash
# Using psql
createdb agaro_vote_db

# Or using PostgreSQL client
psql -U postgres
CREATE DATABASE agaro_vote_db;
```

6. Run the application
```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

The API will be available at: `http://localhost:3000/api/v1`

## 📊 Database Management

### Migrations

TypeORM migrations help manage database schema changes:

```bash
# Generate a new migration based on entity changes
yarn migration:generate src/database/migrations/MigrationName

# Create an empty migration file
yarn migration:create src/database/migrations/MigrationName

# Run pending migrations
yarn migration:run

# Revert the last migration
yarn migration:revert

# Sync schema (development only - not recommended for production)
yarn schema:sync

# Drop all database tables
yarn schema:drop
```

### Auto-Synchronization

⚠️ **Warning**: Synchronization is enabled in development mode (`synchronize: true` in database config) but **disabled in production**. 

This means:
- In development: Database schema auto-updates based on entities
- In production: You must use migrations to update schema

## 🔌 API Endpoints

### Users Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create new user |
| PUT | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user (soft delete) |

### Example Requests

#### Create User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Get All Users
```bash
curl http://localhost:3000/api/v1/users
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov

# Watch mode
yarn test:watch
```

## 📝 Adding a New Module

Follow these steps to add a new module following DDD principles:

1. **Create module structure**:
```bash
mkdir -p src/modules/my-module/{domain/{entities,repositories},application/{dto,use-cases},infrastructure/repositories,presentation/controllers}
```

2. **Create Domain Layer**:
   - Define entity in `domain/entities/my-entity.entity.ts`
   - Define repository interface in `domain/repositories/my-repository.interface.ts`

3. **Create Application Layer**:
   - Create DTOs in `application/dto/`
   - Implement use cases in `application/use-cases/`

4. **Create Infrastructure Layer**:
   - Implement repository in `infrastructure/repositories/typeorm-my.repository.ts`

5. **Create Presentation Layer**:
   - Create controller in `presentation/controllers/my.controller.ts`

6. **Create Module File**:
   - Create `my-module.module.ts` to wire everything together

7. **Register Module**:
   - Add your module to `app.module.ts` imports

## 🔧 Code Quality

### Linting
```bash
yarn lint
```

### Formatting
```bash
yarn format
```

## 🛡️ Error Handling

The application uses a global exception filter that:
- Catches all exceptions
- Transforms them into a consistent response format
- Logs errors appropriately

Example error response:
```json
{
  "success": false,
  "message": "User not found",
  "error": {
    "statusCode": 404,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📦 Response Format

All successful API responses follow this format:
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Your response data
  }
}
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Application port | `3000` |
| `API_PREFIX` | API route prefix | `api` |
| `API_VERSION` | API version | `v1` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `agaro_vote_db` |
| `DB_SSL` | Enable SSL for database | `false` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## 📚 Key Dependencies

- **NestJS**: Progressive Node.js framework
- **TypeORM**: ORM for TypeScript and JavaScript
- **PostgreSQL**: Relational database
- **class-validator**: Validation decorators
- **class-transformer**: Object transformation
- **bcrypt**: Password hashing

## 🏗️ Project Structure Philosophy

### Why DDD?

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Business logic is isolated and easy to test
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Easy to add new features following the same pattern
5. **Domain Focus**: Business logic takes center stage

### Module Independence

Each module is self-contained with its own:
- Domain models
- Business logic
- Data access
- API endpoints

This makes modules:
- Easier to understand
- Simpler to test
- Possible to extract into microservices if needed

## 🤝 Contributing

1. Follow the existing DDD structure
2. Write tests for new features
3. Ensure code passes linting
4. Update documentation as needed

## 📄 License

UNLICENSED - Private Project

## 👥 Team

AGARO Vote Backend Team

---

For more information about NestJS, visit [https://nestjs.com](https://nestjs.com)
For TypeORM documentation, visit [https://typeorm.io](https://typeorm.io)
