# 🚀 CRUD Generator - Complete Example

This document shows exactly what the generator creates when you run:

```bash
yarn generate:crud poll poll
```

---

## 📋 What Gets Generated

### ✅ **13 Files Created Automatically**
### ✅ **Auto-injected into app.module.ts**
### ✅ **5 REST Endpoints Ready**
### ✅ **Full DDD Architecture**

---

## 🎯 Command Output

```bash
$ yarn generate:crud poll poll

🚀 Generating DDD CRUD module: Poll with entity: Poll

📁 Creating directory structure...
✅ Directory structure created!

📝 Generating files...
✅ Created: domain/entities/poll.entity.ts
✅ Created: domain/repositories/poll-repository.interface.ts
✅ Created: application/dto/create-poll.dto.ts
✅ Created: application/dto/update-poll.dto.ts
✅ Created: application/dto/poll-response.dto.ts
✅ Created: application/use-cases/create-poll.use-case.ts
✅ Created: application/use-cases/get-poll-by-id.use-case.ts
✅ Created: application/use-cases/get-all-polls.use-case.ts
✅ Created: application/use-cases/update-poll.use-case.ts
✅ Created: application/use-cases/delete-poll.use-case.ts
✅ Created: infrastructure/repositories/typeorm-poll.repository.ts
✅ Created: presentation/controllers/poll.controller.ts
✅ Created: poll.module.ts

🔧 Injecting into app.module.ts...
✅ Injected PollModule into app.module.ts

✨ Generation complete!
```

---

## 📂 Generated File Structure

```
src/modules/poll/
├── domain/                                    # Domain Layer
│   ├── entities/
│   │   └── poll.entity.ts                    # Entity with base fields
│   └── repositories/
│       └── poll-repository.interface.ts       # Repository contract
│
├── application/                               # Application Layer
│   ├── dto/
│   │   ├── create-poll.dto.ts                # Create DTO with validation
│   │   ├── update-poll.dto.ts                # Update DTO (PartialType)
│   │   └── poll-response.dto.ts              # Response DTO with mapper
│   └── use-cases/
│       ├── create-poll.use-case.ts           # Create business logic
│       ├── get-poll-by-id.use-case.ts        # Get one business logic
│       ├── get-all-polls.use-case.ts         # Get all business logic
│       ├── update-poll.use-case.ts           # Update business logic
│       └── delete-poll.use-case.ts           # Delete business logic
│
├── infrastructure/                            # Infrastructure Layer
│   └── repositories/
│       └── typeorm-poll.repository.ts        # TypeORM implementation
│
├── presentation/                              # Presentation Layer
│   └── controllers/
│       └── poll.controller.ts                # REST controller
│
└── poll.module.ts                            # Module definition
```

---

## 🎯 Generated REST Endpoints

The following endpoints are immediately available:

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| `POST` | `/api/v1/polls` | Create new poll | 201 Created |
| `GET` | `/api/v1/polls` | Get all polls | 200 OK |
| `GET` | `/api/v1/polls/:id` | Get poll by ID | 200 OK |
| `PUT` | `/api/v1/polls/:id` | Update poll | 200 OK |
| `DELETE` | `/api/v1/polls/:id` | Delete poll (soft) | 204 No Content |

---

## 📝 Example Usage

### Create a Poll

```bash
curl -X POST http://localhost:3000/api/v1/polls \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Best Programming Language",
    "description": "Vote for your favorite programming language"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Best Programming Language",
    "description": "Vote for your favorite programming language",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Polls

```bash
curl http://localhost:3000/api/v1/polls
```

### Get Poll by ID

```bash
curl http://localhost:3000/api/v1/polls/uuid-here
```

### Update Poll

```bash
curl -X PUT http://localhost:3000/api/v1/polls/uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Poll Name"
  }'
```

### Delete Poll

```bash
curl -X DELETE http://localhost:3000/api/v1/polls/uuid-here
```

---

## 🔧 Auto-Injection into app.module.ts

The generator automatically updates `app.module.ts`:

**Before:**
```typescript
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [ConfigModule, DatabaseModule, UserModule],
  // ...
})
```

**After:**
```typescript
import { UserModule } from './modules/user/user.module';
import { PollModule } from './modules/poll/poll.module';

@Module({
  imports: [ConfigModule, DatabaseModule, UserModule, PollModule],
  // ...
})
```

✅ **No manual editing required!**

---

## 🎨 Customization Example

After generation, customize the entity:

**1. Edit Entity:**
```typescript
// src/modules/poll/domain/entities/poll.entity.ts
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

  // Domain method
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === PollStatus.ACTIVE &&
      now >= this.startDate &&
      now <= this.endDate
    );
  }
}
```

**2. Update Create DTO:**
```typescript
// src/modules/poll/application/dto/create-poll.dto.ts
import { IsString, IsDate, IsOptional, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePollDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
```

**3. Update Response DTO:**
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
    dto.isActive = poll.isActive(); // Domain method
    dto.createdAt = poll.createdAt;
    dto.updatedAt = poll.updatedAt;
    return dto;
  }

  static fromEntities(polls: Poll[]): PollResponseDto[] {
    return polls.map((poll) => this.fromEntity(poll));
  }
}
```

**4. Generate Migration:**
```bash
yarn migration:generate src/database/migrations/CreatePollsTable
yarn migration:run
```

**5. Test!**
```bash
yarn start:dev
# Now you can use all CRUD endpoints!
```

---

## 💡 What's Included

### ✅ **Entity Features:**
- Extends `BaseEntity` (id, timestamps, soft delete)
- Snake_case column names
- Ready for customization

### ✅ **DTOs:**
- Create DTO with validation decorators
- Update DTO using `PartialType` from `@nestjs/mapped-types`
- Response DTO with `fromEntity()` mapper

### ✅ **Use Cases:**
- Proper dependency injection
- Error handling (NotFoundException)
- Business logic ready to extend

### ✅ **Repository:**
- Implements domain interface
- TypeORM integration
- Soft delete support

### ✅ **Controller:**
- Full REST CRUD operations
- Proper HTTP status codes
- DTO validation

### ✅ **Module:**
- Everything wired together
- Dependency injection configured
- Repository pattern implemented

---

## 🚀 Speed Comparison

### Manual Way (❌ Old):
1. Create 13 files manually
2. Write boilerplate code for each
3. Wire everything in module
4. Import into app.module.ts
5. Test and fix errors

**Time:** ~2-3 hours

### Generator Way (✅ New):
```bash
yarn generate:crud poll poll
```

**Time:** 1 second! ⚡

---

## 🎯 Real-World Example

Let's create a complete voting system:

```bash
# Generate Poll module
yarn generate:crud poll poll

# Generate Option module
yarn generate:crud option option

# Generate Vote module
yarn generate:crud vote vote

# Generate Result module
yarn generate:crud result result
```

**In 4 seconds, you have:**
- ✅ 4 complete modules
- ✅ 52 files generated
- ✅ 20 REST endpoints
- ✅ Full DDD architecture
- ✅ All auto-injected

Now just:
1. Customize entities with relationships
2. Add business logic
3. Generate migrations
4. Done! 🎉

---

## 📚 Related Documentation

- [06-MODULE-GENERATION.md](./06-MODULE-GENERATION.md) - Full generator guide
- [04-ARCHITECTURE.md](./04-ARCHITECTURE.md) - DDD principles
- [05-PROJECT-STRUCTURE.md](./05-PROJECT-STRUCTURE.md) - Project layout

---

**Happy Generating!** 🚀

