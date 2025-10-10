# Module Generation Guide

This guide covers **NestJS CLI commands** and our **custom DDD generators**.

## 🎯 Three Approaches

### **1. NestJS CLI** (Quick & Simple)
For standard NestJS structure

### **2. Custom DDD Structure Generator** (Manual)
Creates folder structure only

### **3. Complete CRUD Generator** (⚡ Recommended!)
Generates full DDD module with CRUD + Auto-injection

---

## 🚀 NestJS CLI Commands

### Basic Syntax
```bash
nest generate <schematic> <name> [options]
# or shorthand
nest g <schematic> <name>
```

### Available Commands

| Command | Shorthand | Description |
|---------|-----------|-------------|
| `nest g module <name>` | `nest g mo` | Generate a module |
| `nest g controller <name>` | `nest g co` | Generate a controller |
| `nest g service <name>` | `nest g s` | Generate a service |
| `nest g class <name>` | `nest g cl` | Generate a class |
| `nest g interface <name>` | `nest g itf` | Generate an interface |
| `nest g guard <name>` | `nest g gu` | Generate a guard |
| `nest g interceptor <name>` | `nest g itc` | Generate an interceptor |
| `nest g filter <name>` | `nest g f` | Generate an exception filter |
| `nest g pipe <name>` | `nest g pi` | Generate a pipe |
| `nest g middleware <name>` | `nest g mi` | Generate middleware |
| `nest g decorator <name>` | `nest g d` | Generate a decorator |
| `nest g resource <name>` | `nest g res` | **Generate complete CRUD resource** |

### Examples

```bash
# Generate a module
nest g module modules/voting

# Generate a controller
nest g controller modules/voting/controllers/voting --flat

# Generate a service
nest g service modules/voting/services/voting --flat

# Generate a complete resource (CRUD)
nest g resource modules/voting
```

### Useful Options

| Option | Description |
|--------|-------------|
| `--flat` | Don't create a subdirectory |
| `--no-spec` | Don't create spec file |
| `--dry-run` | Preview changes without creating files |
| `--skip-import` | Don't import into module |

---

## ⚡ Complete CRUD Generator (RECOMMENDED!)

The most powerful option! Generates a complete DDD module with:
- ✅ Full CRUD operations
- ✅ All layers (Domain, Application, Infrastructure, Presentation)
- ✅ Auto-injection into app.module.ts
- ✅ TypeORM repository
- ✅ All DTOs
- ✅ All use cases
- ✅ Controller with REST endpoints

### Usage

```bash
yarn generate:crud <module-name> <entity-name>
```

### Example

```bash
yarn generate:crud poll poll
```

### What It Generates

**Complete structure with CRUD:**
```
src/modules/poll/
├── domain/
│   ├── entities/
│   │   └── poll.entity.ts ✅ (with base fields)
│   └── repositories/
│       └── poll-repository.interface.ts ✅
├── application/
│   ├── dto/
│   │   ├── create-poll.dto.ts ✅
│   │   ├── update-poll.dto.ts ✅ (uses PartialType)
│   │   └── poll-response.dto.ts ✅
│   └── use-cases/
│       ├── create-poll.use-case.ts ✅
│       ├── get-poll-by-id.use-case.ts ✅
│       ├── get-all-polls.use-case.ts ✅
│       ├── update-poll.use-case.ts ✅
│       └── delete-poll.use-case.ts ✅
├── infrastructure/
│   └── repositories/
│       └── typeorm-poll.repository.ts ✅
├── presentation/
│   └── controllers/
│       └── poll.controller.ts ✅ (full CRUD)
└── poll.module.ts ✅ (everything wired up)
```

### Auto-Injection

The generator automatically:
1. ✅ Adds import to `app.module.ts`
2. ✅ Registers module in imports array
3. ✅ No manual work needed!

### Generated Endpoints

```
POST   /api/v1/polls       - Create
GET    /api/v1/polls       - Get all
GET    /api/v1/polls/:id   - Get one
PUT    /api/v1/polls/:id   - Update
DELETE /api/v1/polls/:id   - Delete (soft)
```

### Next Steps After Generation

1. **Customize entity fields:**
   ```typescript
   // src/modules/poll/domain/entities/poll.entity.ts
   @Column({ name: 'title', type: 'varchar', length: 255 })
   title: string;
   
   @Column({ name: 'status', type: 'varchar' })
   status: string;
   ```

2. **Update DTOs:**
   ```typescript
   // src/modules/poll/application/dto/create-poll.dto.ts
   @IsString()
   title: string;
   
   @IsEnum(PollStatus)
   status: PollStatus;
   ```

3. **Add business logic to use cases**

4. **Generate migration:**
   ```bash
   yarn migration:generate src/database/migrations/CreatePollsTable
   yarn migration:run
   ```

5. **Test your endpoints!**

---

## 🏗️ Custom DDD Structure Generator (Manual)

Creates only the folder structure. You manually create files.

### Usage

```bash
yarn generate:module <module-name> <entity-name>
```

### Example

```bash
yarn generate:module voting vote
```

### What It Creates

```
src/modules/voting/
├── domain/
│   ├── entities/
│   │   └── vote.entity.ts
│   └── repositories/
│       └── vote-repository.interface.ts
├── application/
│   ├── dto/
│   │   ├── create-vote.dto.ts
│   │   ├── update-vote.dto.ts
│   │   └── vote-response.dto.ts
│   └── use-cases/
│       ├── create-vote.use-case.ts
│       ├── get-vote-by-id.use-case.ts
│       ├── get-all-votes.use-case.ts
│       ├── update-vote.use-case.ts
│       └── delete-vote.use-case.ts
├── infrastructure/
│   └── repositories/
│       └── typeorm-vote.repository.ts
├── presentation/
│   └── controllers/
│       └── vote.controller.ts
└── voting.module.ts
```

---

## 📝 Step-by-Step: Creating a New Module

Let's create a **Poll** module as an example.

### Step 1: Generate Structure

```bash
yarn generate:module poll poll
```

### Step 2: Copy User Module as Template

The easiest way is to copy the existing User module:

```bash
# Copy the user module
cp -r src/modules/user src/modules/poll

# Then do a find & replace:
# User -> Poll
# user -> poll
```

### Step 3: Create Entity

**`src/modules/poll/domain/entities/poll.entity.ts`**

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../shared/domain/base.entity';

export enum PollStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('polls')
export class Poll extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PollStatus,
    default: PollStatus.DRAFT,
  })
  status: PollStatus;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  // Domain methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === PollStatus.ACTIVE &&
      now >= this.startDate &&
      now <= this.endDate
    );
  }

  canVote(): boolean {
    return this.isActive();
  }
}
```

### Step 4: Create Repository Interface

**`src/modules/poll/domain/repositories/poll-repository.interface.ts`**

```typescript
import { IRepository } from '../../../../shared/domain/repository.interface';
import { Poll } from '../entities/poll.entity';

export interface IPollRepository extends IRepository<Poll> {
  findActivePolls(): Promise<Poll[]>;
  findByStatus(status: string): Promise<Poll[]>;
}

export const POLL_REPOSITORY = Symbol('POLL_REPOSITORY');
```

### Step 5: Create DTOs

**Create DTO:**
```typescript
// src/modules/poll/application/dto/create-poll.dto.ts
import { IsString, IsDate, IsOptional, MinLength } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
```

**Update DTO:**
```typescript
// src/modules/poll/application/dto/update-poll.dto.ts
import { IsString, IsDate, IsOptional, IsEnum } from 'class-validator';
import { PollStatus } from '../../domain/entities/poll.entity';

export class UpdatePollDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PollStatus)
  status?: PollStatus;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;
}
```

**Response DTO:**
```typescript
// src/modules/poll/application/dto/poll-response.dto.ts
import { Poll, PollStatus } from '../../domain/entities/poll.entity';

export class PollResponseDto {
  id: string;
  title: string;
  description?: string;
  status: PollStatus;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(poll: Poll): PollResponseDto {
    const dto = new PollResponseDto();
    dto.id = poll.id;
    dto.title = poll.title;
    dto.description = poll.description;
    dto.status = poll.status;
    dto.startDate = poll.startDate;
    dto.endDate = poll.endDate;
    dto.isActive = poll.isActive();
    dto.createdAt = poll.createdAt;
    dto.updatedAt = poll.updatedAt;
    return dto;
  }

  static fromEntities(polls: Poll[]): PollResponseDto[] {
    return polls.map((poll) => this.fromEntity(poll));
  }
}
```

### Step 6: Create Use Cases

Follow the User module pattern for:
- `create-poll.use-case.ts`
- `get-poll-by-id.use-case.ts`
- `get-all-polls.use-case.ts`
- `update-poll.use-case.ts`
- `delete-poll.use-case.ts`

### Step 7: Create Repository Implementation

```typescript
// src/modules/poll/infrastructure/repositories/typeorm-poll.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll, PollStatus } from '../../domain/entities/poll.entity';
import { IPollRepository } from '../../domain/repositories/poll-repository.interface';

@Injectable()
export class TypeOrmPollRepository implements IPollRepository {
  constructor(
    @InjectRepository(Poll)
    private readonly repository: Repository<Poll>,
  ) {}

  async findAll(): Promise<Poll[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<Poll | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findActivePolls(): Promise<Poll[]> {
    return await this.repository.find({
      where: { status: PollStatus.ACTIVE },
    });
  }

  async findByStatus(status: string): Promise<Poll[]> {
    return await this.repository.find({
      where: { status: status as PollStatus },
    });
  }

  async create(entity: Partial<Poll>): Promise<Poll> {
    const poll = this.repository.create(entity);
    return await this.repository.save(poll);
  }

  async update(id: string, entity: Partial<Poll>): Promise<Poll> {
    await this.repository.update(id, entity);
    const poll = await this.findById(id);
    if (!poll) {
      throw new Error('Poll not found after update');
    }
    return poll;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}
```

### Step 8: Create Controller

Follow the User controller pattern.

### Step 9: Create Module File

```typescript
// src/modules/poll/poll.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './domain/entities/poll.entity';
import { POLL_REPOSITORY } from './domain/repositories/poll-repository.interface';
import { TypeOrmPollRepository } from './infrastructure/repositories/typeorm-poll.repository';
import { PollController } from './presentation/controllers/poll.controller';
import { CreatePollUseCase } from './application/use-cases/create-poll.use-case';
import { GetPollByIdUseCase } from './application/use-cases/get-poll-by-id.use-case';
import { GetAllPollsUseCase } from './application/use-cases/get-all-polls.use-case';
import { UpdatePollUseCase } from './application/use-cases/update-poll.use-case';
import { DeletePollUseCase } from './application/use-cases/delete-poll.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Poll])],
  controllers: [PollController],
  providers: [
    {
      provide: POLL_REPOSITORY,
      useClass: TypeOrmPollRepository,
    },
    CreatePollUseCase,
    GetPollByIdUseCase,
    GetAllPollsUseCase,
    UpdatePollUseCase,
    DeletePollUseCase,
  ],
  exports: [POLL_REPOSITORY],
})
export class PollModule {}
```

### Step 10: Register in App Module

```typescript
// src/app.module.ts
import { PollModule } from './modules/poll/poll.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UserModule,
    PollModule, // Add here
  ],
  // ...
})
export class AppModule {}
```

### Step 11: Generate Migration

```bash
yarn migration:generate src/database/migrations/CreatePollsTable
yarn migration:run
```

---

## 🎯 Quick Reference

```bash
# ⚡ RECOMMENDED: Complete CRUD Generator
yarn generate:crud <module-name> <entity-name>
# Example:
yarn generate:crud poll poll

# Custom DDD Structure Generator (folders only)
yarn generate:module <module-name> <entity-name>
# Example:
yarn generate:module voting vote

# NestJS CLI (standard structure)
nest g module modules/voting
nest g controller modules/voting/controllers/voting --flat --no-spec
nest g service modules/voting/services/voting --flat --no-spec
nest g resource modules/voting  # Complete CRUD (non-DDD)
```

---

## 💡 Best Practices

1. **Always follow the DDD structure** - Use the custom generator
2. **Copy User module as template** - Fastest way to start
3. **Update imports** - Make sure all paths are correct
4. **Generate migrations** - Don't rely on synchronize
5. **Register in AppModule** - Don't forget to import
6. **Write tests** - Follow the same structure

---

## 🔧 Troubleshooting

**Module not found?**
- Check if you registered it in `app.module.ts`
- Verify import paths are correct

**TypeORM entity not recognized?**
- Make sure entity has `.entity.ts` suffix
- Check if entity path is in `database.config.ts`

**Migration errors?**
- Run `yarn build` first
- Check entity decorators are correct
- Verify database connection

---

## 📚 Related Docs

- [Project Structure](./05-PROJECT-STRUCTURE.md)
- [Architecture Guide](./04-ARCHITECTURE.md)
- [Setup Guide](./02-SETUP.md)

Happy coding! 🚀

