#!/bin/bash

# DDD Module Generator Script
# Usage: ./scripts/generate-module.sh <module-name> <entity-name>
# Example: ./scripts/generate-module.sh voting vote

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./scripts/generate-module.sh <module-name> <entity-name>"
    echo "Example: ./scripts/generate-module.sh voting vote"
    exit 1
fi

MODULE_NAME=$1
ENTITY_NAME=$2
ENTITY_NAME_PASCAL=$(echo $ENTITY_NAME | sed -e 's/\b\(.\)/\u\1/g')
MODULE_PATH="src/modules/$MODULE_NAME"

echo "🚀 Generating DDD module: $MODULE_NAME with entity: $ENTITY_NAME_PASCAL"

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p "$MODULE_PATH/domain/entities"
mkdir -p "$MODULE_PATH/domain/repositories"
mkdir -p "$MODULE_PATH/application/dto"
mkdir -p "$MODULE_PATH/application/use-cases"
mkdir -p "$MODULE_PATH/infrastructure/repositories"
mkdir -p "$MODULE_PATH/presentation/controllers"

echo "✅ Directory structure created!"
echo ""
echo "📝 Generated structure:"
echo "src/modules/$MODULE_NAME/"
echo "├── domain/"
echo "│   ├── entities/"
echo "│   │   └── $ENTITY_NAME.entity.ts (create this)"
echo "│   └── repositories/"
echo "│       └── $ENTITY_NAME-repository.interface.ts (create this)"
echo "├── application/"
echo "│   ├── dto/"
echo "│   │   ├── create-$ENTITY_NAME.dto.ts (create this)"
echo "│   │   ├── update-$ENTITY_NAME.dto.ts (create this)"
echo "│   │   └── $ENTITY_NAME-response.dto.ts (create this)"
echo "│   └── use-cases/"
echo "│       └── (create use case files)"
echo "├── infrastructure/"
echo "│   └── repositories/"
echo "│       └── typeorm-$ENTITY_NAME.repository.ts (create this)"
echo "├── presentation/"
echo "│   └── controllers/"
echo "│       └── $ENTITY_NAME.controller.ts (create this)"
echo "└── $MODULE_NAME.module.ts (create this)"
echo ""
echo "💡 Next steps:"
echo "1. Copy the User module as a template"
echo "2. Replace 'User' with '$ENTITY_NAME_PASCAL'"
echo "3. Replace 'user' with '$ENTITY_NAME'"
echo "4. Update business logic for your domain"
echo ""
echo "✨ Done!"

