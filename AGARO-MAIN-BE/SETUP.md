# Setup Guide

This guide will help you set up and run the AGARO Vote backend application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Yarn** - [Installation Guide](https://yarnpkg.com/getting-started/install)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
  - Alternatively, use Docker (see Docker Setup below)
- **Git** - [Download](https://git-scm.com/downloads)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AGARO-MAIN-BE
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

The easiest way to set up PostgreSQL is using Docker Compose:

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check if containers are running
docker ps
```

**Access Points:**
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`
  - Email: `admin@agaro.com`
  - Password: `admin`

#### Option B: Local PostgreSQL Installation

If you have PostgreSQL installed locally:

```bash
# Create database
createdb agaro_vote_db

# Or using psql
psql -U postgres
CREATE DATABASE agaro_vote_db;
\q
```

### 4. Environment Configuration

A `.env` file has been created for you with default values. Update it if needed:

```bash
# Edit .env file
nano .env
```

**Important environment variables:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=agaro_vote_db
```

### 5. Run the Application

```bash
# Development mode with hot reload
yarn start:dev

# Or standard start
yarn start
```

The application will be available at:
- API: `http://localhost:3000/api/v1`
- Health Check: `http://localhost:3000/api/v1/health`

## Verification

### 1. Check Health Endpoint

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456
  }
}
```

### 2. Test User Endpoints

Create a user:
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Get all users:
```bash
curl http://localhost:3000/api/v1/users
```

## Database Migrations

Since `synchronize: true` is enabled in development, your database schema will automatically update based on your entities. However, for production, you should use migrations:

### Generate Migration

```bash
# After changing entities, generate a migration
yarn migration:generate src/database/migrations/InitialMigration
```

### Run Migrations

```bash
yarn migration:run
```

### Revert Migration

```bash
yarn migration:revert
```

## Development Workflow

### 1. Create a New Module

Follow the DDD structure:

```bash
# Create directories
mkdir -p src/modules/my-module/{domain/{entities,repositories},application/{dto,use-cases},infrastructure/repositories,presentation/controllers}
```

### 2. Run Linter

```bash
yarn lint
```

### 3. Format Code

```bash
yarn format
```

### 4. Run Tests

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Coverage
yarn test:cov
```

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   # For Docker
   docker ps
   
   # For local PostgreSQL
   sudo service postgresql status
   ```

2. Verify connection details in `.env`

3. Check PostgreSQL logs:
   ```bash
   # For Docker
   docker logs agaro_postgres
   ```

### Port Already in Use

**Problem:** Port 3000 is already in use

**Solution:**
1. Change the port in `.env`:
   ```env
   PORT=3001
   ```

2. Or stop the process using the port:
   ```bash
   # Find process
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

### Yarn Lock File Issues

**Problem:** Dependencies not installing correctly

**Solution:**
```bash
# Clean install
rm -rf node_modules yarn.lock
yarn install
```

### TypeORM Entity Not Found

**Problem:** TypeORM cannot find entities

**Solution:**
1. Ensure entities have `.entity.ts` suffix
2. Check `entities` path in `database.config.ts`
3. Restart the application

## Docker Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
```

### Reset Database

```bash
# Stop and remove containers with volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## pgAdmin Setup

After starting Docker Compose, you can use pgAdmin to manage your database:

1. Open `http://localhost:5050`
2. Login with:
   - Email: `admin@agaro.com`
   - Password: `admin`
3. Add new server:
   - **Name:** AGARO DB
   - **Host:** `host.docker.internal` (Mac/Windows) or `172.17.0.1` (Linux)
   - **Port:** `5432`
   - **Username:** `postgres`
   - **Password:** `postgres`
   - **Database:** `agaro_vote_db`

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- TypeScript
- Docker

### WebStorm / IntelliJ IDEA

1. Enable ESLint:
   - Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable Prettier:
   - Settings → Languages & Frameworks → JavaScript → Prettier

## Production Build

```bash
# Build
yarn build

# Run production
yarn start:prod
```

**Note:** Remember to:
1. Set `NODE_ENV=production` in `.env`
2. Use proper database credentials
3. Disable `synchronize` in TypeORM (it's already disabled for production)
4. Run migrations instead of using synchronize

## Next Steps

1. Read the [Architecture Documentation](./ARCHITECTURE.md) to understand the project structure
2. Check the [README](./README.md) for API documentation
3. Start building your features following the DDD pattern

## Getting Help

If you encounter any issues not covered here:

1. Check the [README.md](./README.md)
2. Review the [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Look at the example User module implementation
4. Check NestJS documentation: https://docs.nestjs.com
5. Check TypeORM documentation: https://typeorm.io

## Useful Commands

```bash
# Development
yarn start:dev          # Start with hot reload
yarn lint              # Lint code
yarn format            # Format code
yarn test              # Run tests

# Database
yarn migration:generate # Generate migration
yarn migration:run     # Run migrations
yarn migration:revert  # Revert last migration

# Docker
docker-compose up -d   # Start services
docker-compose down    # Stop services
docker-compose logs -f # View logs

# Build
yarn build            # Build for production
yarn start:prod       # Run production build
```

---

Happy coding! 🚀

