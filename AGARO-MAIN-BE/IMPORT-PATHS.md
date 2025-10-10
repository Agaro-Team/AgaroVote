# Absolute Import Paths Guide

This project is configured to use absolute import paths for better code organization and maintainability.

## Available Import Aliases

The following import aliases are configured in `tsconfig.json`:

| Alias | Maps to | Usage |
|-------|---------|-------|
| `@/*` | `src/*` | Generic path for anything in src |
| `@config/*` | `src/config/*` | Configuration files |
| `@modules/*` | `src/modules/*` | Feature modules |
| `@shared/*` | `src/shared/*` | Shared utilities and components |
| `@database/*` | `src/database/*` | Database migrations and seeds |

## Examples

### Before (Relative Imports)
```typescript
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { ResponseDto } from '../../../../shared/application/dto/response.dto';
```

### After (Absolute Imports)
```typescript
import { User } from '@modules/user/domain/entities/user.entity';
import { IUserRepository } from '@modules/user/domain/repositories/user-repository.interface';
import { ResponseDto } from '@shared/application/dto/response.dto';
```

## Common Usage Patterns

### Importing from Modules
```typescript
// User module
import { User } from '@modules/user/domain/entities/user.entity';
import { CreateUserDto } from '@modules/user/application/dto/create-user.dto';
import { UserController } from '@modules/user/presentation/controllers/user.controller';

// Other modules
import { Product } from '@modules/product/domain/entities/product.entity';
```

### Importing Shared Resources
```typescript
// DTOs
import { ResponseDto } from '@shared/application/dto/response.dto';
import { PaginationDto } from '@shared/application/dto/pagination.dto';

// Base entities
import { BaseEntity } from '@shared/domain/base.entity';

// Filters and interceptors
import { HttpExceptionFilter } from '@shared/presentation/filters/http-exception.filter';
import { TransformInterceptor } from '@shared/presentation/interceptors/transform.interceptor';
```

### Importing Configuration
```typescript
import { AppConfig } from '@config/app.config';
import { DatabaseConfig } from '@config/database.config';
```

### Using the Generic @ Alias
```typescript
// You can also use @/ for any file in src
import { AppService } from '@/app.service';
import { AppModule } from '@/app.module';
```

## Configuration Details

The absolute imports are configured in three places:

1. **tsconfig.json** - TypeScript path mappings
2. **package.json** - Jest moduleNameMapper for tests
3. **tsconfig-paths** - Runtime support (already installed)

## Benefits

✅ **Cleaner Imports**: No more `../../../` chains  
✅ **Better Refactoring**: Moving files doesn't break imports  
✅ **Easier Navigation**: Clear, consistent import paths  
✅ **Improved Readability**: Immediately see where imports come from  
✅ **IDE Support**: Full autocomplete and IntelliSense support

## Tips

- Always prefer absolute imports over relative imports for files outside the current module
- Use relative imports (`./`, `../`) only for files within the same directory or one level up
- Keep imports organized: external packages → absolute imports → relative imports

## Verification

To verify the configuration is working:

```bash
# Run TypeScript type checking
yarn ts:check

# Run the build
yarn build

# Run tests
yarn test
```

All commands should work without any path resolution issues.

