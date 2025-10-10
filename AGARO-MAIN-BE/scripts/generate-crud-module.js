#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(
    '❌ Usage: node scripts/generate-crud-module.js <module-name> <entity-name>',
  );
  console.log('Example: node scripts/generate-crud-module.js poll poll');
  process.exit(1);
}

const moduleName = args[0];
const entityName = args[1];
const entityNamePascal = toPascalCase(entityName);
const moduleNamePascal = toPascalCase(moduleName);

console.log(
  `\n🚀 Generating DDD CRUD module: ${moduleNamePascal} with entity: ${entityNamePascal}\n`,
);

// Helper functions
function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Create directory structure
const modulePath = path.join(__dirname, '..', 'src', 'modules', moduleName);
console.log('📁 Creating directory structure...');

ensureDir(`${modulePath}/domain/entities`);
ensureDir(`${modulePath}/domain/repositories`);
ensureDir(`${modulePath}/application/dto`);
ensureDir(`${modulePath}/application/use-cases`);
ensureDir(`${modulePath}/infrastructure/repositories`);
ensureDir(`${modulePath}/presentation/controllers`);

console.log('✅ Directory structure created!\n');

// Generate files
console.log('📝 Generating files...\n');

// 1. Entity
const entityContent = `import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../shared/domain/base.entity';

@Entity('${entityName}s')
export class ${entityNamePascal} extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // Add your domain methods here
  // Example:
  // isActive(): boolean {
  //   return true;
  // }
}
`;
fs.writeFileSync(
  `${modulePath}/domain/entities/${entityName}.entity.ts`,
  entityContent,
);
console.log(`✅ Created: domain/entities/${entityName}.entity.ts`);

// 2. Repository Interface
const repositoryInterfaceContent = `import { IRepository } from '../../../../shared/domain/repository.interface';
import { ${entityNamePascal} } from '../entities/${entityName}.entity';

export interface I${entityNamePascal}Repository extends IRepository<${entityNamePascal}> {
  // Add custom repository methods here
  // Example:
  // findByName(name: string): Promise<${entityNamePascal} | null>;
}

export const ${entityName.toUpperCase()}_REPOSITORY = Symbol('${entityName.toUpperCase()}_REPOSITORY');
`;
fs.writeFileSync(
  `${modulePath}/domain/repositories/${entityName}-repository.interface.ts`,
  repositoryInterfaceContent,
);
console.log(
  `✅ Created: domain/repositories/${entityName}-repository.interface.ts`,
);

// 3. Create DTO
const createDtoContent = `import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class Create${entityNamePascal}Dto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Add your fields here
}
`;
fs.writeFileSync(
  `${modulePath}/application/dto/create-${entityName}.dto.ts`,
  createDtoContent,
);
console.log(`✅ Created: application/dto/create-${entityName}.dto.ts`);

// 4. Update DTO
const updateDtoContent = `import { PartialType } from '@nestjs/mapped-types';
import { Create${entityNamePascal}Dto } from './create-${entityName}.dto';

export class Update${entityNamePascal}Dto extends PartialType(Create${entityNamePascal}Dto) {}
`;
fs.writeFileSync(
  `${modulePath}/application/dto/update-${entityName}.dto.ts`,
  updateDtoContent,
);
console.log(`✅ Created: application/dto/update-${entityName}.dto.ts`);

// 5. Response DTO
const responseDtoContent = `import { ${entityNamePascal} } from '../../domain/entities/${entityName}.entity';

export class ${entityNamePascal}ResponseDto {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(${toCamelCase(entityName)}: ${entityNamePascal}): ${entityNamePascal}ResponseDto {
    const dto = new ${entityNamePascal}ResponseDto();
    dto.id = ${toCamelCase(entityName)}.id;
    dto.name = ${toCamelCase(entityName)}.name;
    dto.description = ${toCamelCase(entityName)}.description;
    dto.createdAt = ${toCamelCase(entityName)}.createdAt;
    dto.updatedAt = ${toCamelCase(entityName)}.updatedAt;
    return dto;
  }

  static fromEntities(${toCamelCase(entityName)}s: ${entityNamePascal}[]): ${entityNamePascal}ResponseDto[] {
    return ${toCamelCase(entityName)}s.map((${toCamelCase(entityName)}) => this.fromEntity(${toCamelCase(entityName)}));
  }
}
`;
fs.writeFileSync(
  `${modulePath}/application/dto/${entityName}-response.dto.ts`,
  responseDtoContent,
);
console.log(`✅ Created: application/dto/${entityName}-response.dto.ts`);

// 6. Use Cases
const useCases = [
  {
    name: `create-${entityName}.use-case.ts`,
    content: `import { Injectable, Inject, ConflictException } from '@nestjs/common';
import {
  ${entityName.toUpperCase()}_REPOSITORY,
  type I${entityNamePascal}Repository,
} from '../../domain/repositories/${entityName}-repository.interface';
import { Create${entityNamePascal}Dto } from '../dto/create-${entityName}.dto';
import { ${entityNamePascal} } from '../../domain/entities/${entityName}.entity';

@Injectable()
export class Create${entityNamePascal}UseCase {
  constructor(
    @Inject(${entityName.toUpperCase()}_REPOSITORY)
    private readonly ${toCamelCase(entityName)}Repository: I${entityNamePascal}Repository,
  ) {}

  async execute(create${entityNamePascal}Dto: Create${entityNamePascal}Dto): Promise<${entityNamePascal}> {
    // Add your business logic here
    // Example: check for duplicates, validate business rules, etc.

    const ${toCamelCase(entityName)} = await this.${toCamelCase(entityName)}Repository.create(create${entityNamePascal}Dto);
    return ${toCamelCase(entityName)};
  }
}
`,
  },
  {
    name: `get-${entityName}-by-id.use-case.ts`,
    content: `import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ${entityName.toUpperCase()}_REPOSITORY,
  type I${entityNamePascal}Repository,
} from '../../domain/repositories/${entityName}-repository.interface';
import { ${entityNamePascal} } from '../../domain/entities/${entityName}.entity';

@Injectable()
export class Get${entityNamePascal}ByIdUseCase {
  constructor(
    @Inject(${entityName.toUpperCase()}_REPOSITORY)
    private readonly ${toCamelCase(entityName)}Repository: I${entityNamePascal}Repository,
  ) {}

  async execute(id: string): Promise<${entityNamePascal}> {
    const ${toCamelCase(entityName)} = await this.${toCamelCase(entityName)}Repository.findById(id);

    if (!${toCamelCase(entityName)}) {
      throw new NotFoundException('${entityNamePascal} not found');
    }

    return ${toCamelCase(entityName)};
  }
}
`,
  },
  {
    name: `get-all-${entityName}s.use-case.ts`,
    content: `import { Injectable, Inject } from '@nestjs/common';
import {
  ${entityName.toUpperCase()}_REPOSITORY,
  type I${entityNamePascal}Repository,
} from '../../domain/repositories/${entityName}-repository.interface';
import { ${entityNamePascal} } from '../../domain/entities/${entityName}.entity';

@Injectable()
export class GetAll${entityNamePascal}sUseCase {
  constructor(
    @Inject(${entityName.toUpperCase()}_REPOSITORY)
    private readonly ${toCamelCase(entityName)}Repository: I${entityNamePascal}Repository,
  ) {}

  async execute(): Promise<${entityNamePascal}[]> {
    return await this.${toCamelCase(entityName)}Repository.findAll();
  }
}
`,
  },
  {
    name: `update-${entityName}.use-case.ts`,
    content: `import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ${entityName.toUpperCase()}_REPOSITORY,
  type I${entityNamePascal}Repository,
} from '../../domain/repositories/${entityName}-repository.interface';
import { Update${entityNamePascal}Dto } from '../dto/update-${entityName}.dto';
import { ${entityNamePascal} } from '../../domain/entities/${entityName}.entity';

@Injectable()
export class Update${entityNamePascal}UseCase {
  constructor(
    @Inject(${entityName.toUpperCase()}_REPOSITORY)
    private readonly ${toCamelCase(entityName)}Repository: I${entityNamePascal}Repository,
  ) {}

  async execute(id: string, update${entityNamePascal}Dto: Update${entityNamePascal}Dto): Promise<${entityNamePascal}> {
    const ${toCamelCase(entityName)} = await this.${toCamelCase(entityName)}Repository.findById(id);

    if (!${toCamelCase(entityName)}) {
      throw new NotFoundException('${entityNamePascal} not found');
    }

    return await this.${toCamelCase(entityName)}Repository.update(id, update${entityNamePascal}Dto);
  }
}
`,
  },
  {
    name: `delete-${entityName}.use-case.ts`,
    content: `import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ${entityName.toUpperCase()}_REPOSITORY,
  type I${entityNamePascal}Repository,
} from '../../domain/repositories/${entityName}-repository.interface';

@Injectable()
export class Delete${entityNamePascal}UseCase {
  constructor(
    @Inject(${entityName.toUpperCase()}_REPOSITORY)
    private readonly ${toCamelCase(entityName)}Repository: I${entityNamePascal}Repository,
  ) {}

  async execute(id: string): Promise<boolean> {
    const ${toCamelCase(entityName)} = await this.${toCamelCase(entityName)}Repository.findById(id);

    if (!${toCamelCase(entityName)}) {
      throw new NotFoundException('${entityNamePascal} not found');
    }

    return await this.${toCamelCase(entityName)}Repository.delete(id);
  }
}
`,
  },
];

useCases.forEach((useCase) => {
  fs.writeFileSync(
    `${modulePath}/application/use-cases/${useCase.name}`,
    useCase.content,
  );
  console.log(`✅ Created: application/use-cases/${useCase.name}`);
});

// 7. TypeORM Repository
const typeormRepoContent = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${entityNamePascal} } from '../../domain/entities/${entityName}.entity';
import { I${entityNamePascal}Repository } from '../../domain/repositories/${entityName}-repository.interface';

@Injectable()
export class TypeORM${entityNamePascal}Repository implements I${entityNamePascal}Repository {
  constructor(
    @InjectRepository(${entityNamePascal})
    private readonly repository: Repository<${entityNamePascal}>,
  ) {}

  async findAll(): Promise<${entityNamePascal}[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<${entityNamePascal} | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(entity: Partial<${entityNamePascal}>): Promise<${entityNamePascal}> {
    const ${toCamelCase(entityName)} = this.repository.create(entity);
    return await this.repository.save(${toCamelCase(entityName)});
  }

  async update(id: string, entity: Partial<${entityNamePascal}>): Promise<${entityNamePascal}> {
    await this.repository.update(id, entity);
    const ${toCamelCase(entityName)} = await this.findById(id);
    if (!${toCamelCase(entityName)}) {
      throw new Error('${entityNamePascal} not found after update');
    }
    return ${toCamelCase(entityName)};
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  // Add custom repository methods here
}
`;
fs.writeFileSync(
  `${modulePath}/infrastructure/repositories/typeorm-${entityName}.repository.ts`,
  typeormRepoContent,
);
console.log(
  `✅ Created: infrastructure/repositories/typeorm-${entityName}.repository.ts`,
);

// 8. Controller
const controllerContent = `import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Create${entityNamePascal}Dto } from '../../application/dto/create-${entityName}.dto';
import { Update${entityNamePascal}Dto } from '../../application/dto/update-${entityName}.dto';
import { ${entityNamePascal}ResponseDto } from '../../application/dto/${entityName}-response.dto';
import { Create${entityNamePascal}UseCase } from '../../application/use-cases/create-${entityName}.use-case';
import { Get${entityNamePascal}ByIdUseCase } from '../../application/use-cases/get-${entityName}-by-id.use-case';
import { GetAll${entityNamePascal}sUseCase } from '../../application/use-cases/get-all-${entityName}s.use-case';
import { Update${entityNamePascal}UseCase } from '../../application/use-cases/update-${entityName}.use-case';
import { Delete${entityNamePascal}UseCase } from '../../application/use-cases/delete-${entityName}.use-case';

@Controller('${entityName}s')
export class ${entityNamePascal}Controller {
  constructor(
    private readonly create${entityNamePascal}UseCase: Create${entityNamePascal}UseCase,
    private readonly get${entityNamePascal}ByIdUseCase: Get${entityNamePascal}ByIdUseCase,
    private readonly getAll${entityNamePascal}sUseCase: GetAll${entityNamePascal}sUseCase,
    private readonly update${entityNamePascal}UseCase: Update${entityNamePascal}UseCase,
    private readonly delete${entityNamePascal}UseCase: Delete${entityNamePascal}UseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() create${entityNamePascal}Dto: Create${entityNamePascal}Dto): Promise<${entityNamePascal}ResponseDto> {
    const ${toCamelCase(entityName)} = await this.create${entityNamePascal}UseCase.execute(create${entityNamePascal}Dto);
    return ${entityNamePascal}ResponseDto.fromEntity(${toCamelCase(entityName)});
  }

  @Get()
  async findAll(): Promise<${entityNamePascal}ResponseDto[]> {
    const ${toCamelCase(entityName)}s = await this.getAll${entityNamePascal}sUseCase.execute();
    return ${entityNamePascal}ResponseDto.fromEntities(${toCamelCase(entityName)}s);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<${entityNamePascal}ResponseDto> {
    const ${toCamelCase(entityName)} = await this.get${entityNamePascal}ByIdUseCase.execute(id);
    return ${entityNamePascal}ResponseDto.fromEntity(${toCamelCase(entityName)});
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() update${entityNamePascal}Dto: Update${entityNamePascal}Dto,
  ): Promise<${entityNamePascal}ResponseDto> {
    const ${toCamelCase(entityName)} = await this.update${entityNamePascal}UseCase.execute(id, update${entityNamePascal}Dto);
    return ${entityNamePascal}ResponseDto.fromEntity(${toCamelCase(entityName)});
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.delete${entityNamePascal}UseCase.execute(id);
  }
}
`;
fs.writeFileSync(
  `${modulePath}/presentation/controllers/${entityName}.controller.ts`,
  controllerContent,
);
console.log(`✅ Created: presentation/controllers/${entityName}.controller.ts`);

// 9. Module
const moduleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${entityNamePascal} } from './domain/entities/${entityName}.entity';
import { ${entityName.toUpperCase()}_REPOSITORY } from './domain/repositories/${entityName}-repository.interface';
import { TypeORM${entityNamePascal}Repository } from './infrastructure/repositories/typeorm-${entityName}.repository';
import { ${entityNamePascal}Controller } from './presentation/controllers/${entityName}.controller';
import { Create${entityNamePascal}UseCase } from './application/use-cases/create-${entityName}.use-case';
import { Get${entityNamePascal}ByIdUseCase } from './application/use-cases/get-${entityName}-by-id.use-case';
import { GetAll${entityNamePascal}sUseCase } from './application/use-cases/get-all-${entityName}s.use-case';
import { Update${entityNamePascal}UseCase } from './application/use-cases/update-${entityName}.use-case';
import { Delete${entityNamePascal}UseCase } from './application/use-cases/delete-${entityName}.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([${entityNamePascal}])],
  controllers: [${entityNamePascal}Controller],
  providers: [
    {
      provide: ${entityName.toUpperCase()}_REPOSITORY,
      useClass: TypeORM${entityNamePascal}Repository,
    },
    Create${entityNamePascal}UseCase,
    Get${entityNamePascal}ByIdUseCase,
    GetAll${entityNamePascal}sUseCase,
    Update${entityNamePascal}UseCase,
    Delete${entityNamePascal}UseCase,
  ],
  exports: [${entityName.toUpperCase()}_REPOSITORY],
})
export class ${moduleNamePascal}Module {}
`;
fs.writeFileSync(`${modulePath}/${moduleName}.module.ts`, moduleContent);
console.log(`✅ Created: ${moduleName}.module.ts\n`);

// 10. Auto-inject into app.module.ts
console.log('🔧 Injecting into app.module.ts...');
const appModulePath = path.join(__dirname, '..', 'src', 'app.module.ts');
let appModuleContent = fs.readFileSync(appModulePath, 'utf-8');

const importStatement = `import { ${moduleNamePascal}Module } from './modules/${moduleName}/${moduleName}.module';`;
const moduleImport = `${moduleNamePascal}Module`;

// Check if already imported
if (!appModuleContent.includes(importStatement)) {
  // Add import statement - find the last import and add after it
  const lines = appModuleContent.split('\n');
  let lastImportLine = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportLine = i;
    }
  }

  if (lastImportLine !== -1) {
    lines.splice(lastImportLine + 1, 0, importStatement);
    appModuleContent = lines.join('\n');
  }

  // Add to imports array - handle multi-line arrays properly
  const importsArrayRegex = /imports:\s*\[([^\]]*)\]/s;
  const match = appModuleContent.match(importsArrayRegex);

  if (match) {
    const currentImportsContent = match[1];
    const hasContent = currentImportsContent.trim().length > 0;

    // Check if it's a single-line or multi-line array
    const isSingleLine = !currentImportsContent.includes('\n');

    let newImportsContent;
    if (isSingleLine && hasContent) {
      // Single line: imports: [ConfigModule, DatabaseModule]
      newImportsContent = `${currentImportsContent}, ${moduleImport}`;
    } else if (!isSingleLine && hasContent) {
      // Multi-line: preserve formatting
      // Remove trailing whitespace/newlines, add comma and new module
      const trimmedContent = currentImportsContent.trimEnd();
      newImportsContent = `${trimmedContent}, ${moduleImport}`;
    } else {
      // Empty array
      newImportsContent = moduleImport;
    }

    appModuleContent = appModuleContent.replace(
      importsArrayRegex,
      `imports: [${newImportsContent}]`,
    );
  }

  fs.writeFileSync(appModulePath, appModuleContent);
  console.log(`✅ Injected ${moduleNamePascal}Module into app.module.ts\n`);
} else {
  console.log(
    `⚠️  ${moduleNamePascal}Module already exists in app.module.ts\n`,
  );
}

// Summary
console.log('✨ Generation complete!\n');
console.log('📦 Module structure:');
console.log(`src/modules/${moduleName}/`);
console.log(`├── domain/`);
console.log(`│   ├── entities/${entityName}.entity.ts`);
console.log(`│   └── repositories/${entityName}-repository.interface.ts`);
console.log(`├── application/`);
console.log(`│   ├── dto/`);
console.log(`│   │   ├── create-${entityName}.dto.ts`);
console.log(`│   │   ├── update-${entityName}.dto.ts`);
console.log(`│   │   └── ${entityName}-response.dto.ts`);
console.log(`│   └── use-cases/`);
console.log(`│       ├── create-${entityName}.use-case.ts`);
console.log(`│       ├── get-${entityName}-by-id.use-case.ts`);
console.log(`│       ├── get-all-${entityName}s.use-case.ts`);
console.log(`│       ├── update-${entityName}.use-case.ts`);
console.log(`│       └── delete-${entityName}.use-case.ts`);
console.log(`├── infrastructure/`);
console.log(`│   └── repositories/typeorm-${entityName}.repository.ts`);
console.log(`├── presentation/`);
console.log(`│   └── controllers/${entityName}.controller.ts`);
console.log(`└── ${moduleName}.module.ts\n`);

console.log('🎯 CRUD Endpoints created:');
console.log(`   POST   /api/v1/${entityName}s`);
console.log(`   GET    /api/v1/${entityName}s`);
console.log(`   GET    /api/v1/${entityName}s/:id`);
console.log(`   PUT    /api/v1/${entityName}s/:id`);
console.log(`   DELETE /api/v1/${entityName}s/:id\n`);

console.log('📝 Next steps:');
console.log('1. Customize the entity fields in the entity file');
console.log('2. Add business logic to use cases');
console.log('3. Generate and run migration:');
console.log(
  `   yarn migration:generate src/database/migrations/Create${entityNamePascal}sTable`,
);
console.log(`   yarn migration:run`);
console.log('4. Test your endpoints!\n');

console.log('🚀 Happy coding!\n');
