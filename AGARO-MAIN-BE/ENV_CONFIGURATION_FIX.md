# Environment Configuration Troubleshooting

## ✅ Fixed: Migration Commands Not Loading Correct .env File

### Problem
When running `yarn migration:run`, TypeORM was not loading the correct environment file (`.env.development` or `.env.local`), causing database connection issues.

### Root Cause
The original `ormconfig.ts` was hardcoded to load `.env.{NODE_ENV}` but:
1. `NODE_ENV` was not set when running migration commands
2. No fallback logic for `.env.local` or `.env`
3. Migration scripts didn't explicitly set `NODE_ENV`

### Solution

#### 1. Updated `ormconfig.ts` with Fallback Logic

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables with fallback logic
// Priority: .env.{NODE_ENV} > .env.local > .env
const nodeEnv = process.env.NODE_ENV || 'development';
const envFiles = [
  `.env.${nodeEnv}`, // .env.development, .env.production, etc.
  '.env.local', // Local overrides
  '.env', // Default fallback
];

// Load the first existing env file
for (const envFile of envFiles) {
  const envPath = path.resolve(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    console.log(`[ORM Config] Loading environment from: ${envFile}`);
    config({ path: envPath });
    break;
  }
}
```

**Benefits:**
- ✅ Automatically detects which `.env` file exists
- ✅ Prints which file is loaded (helpful for debugging)
- ✅ Supports multiple environments with fallback

#### 2. Updated `package.json` Scripts

Added `NODE_ENV=development` to all migration scripts:

```json
{
  "scripts": {
    "migration:generate": "NODE_ENV=development ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d ./ormconfig.ts",
    "migration:run": "NODE_ENV=development ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ./ormconfig.ts",
    "migration:revert": "NODE_ENV=development ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:revert -d ./ormconfig.ts",
    "migration:run:prod": "NODE_ENV=production node ./node_modules/typeorm/cli.js migration:run -d ./dist/ormconfig.js"
  }
}
```

### Environment File Priority

When you run `yarn migration:run`, the system will check in this order:

1. **`.env.development`** (if `NODE_ENV=development`)
2. **`.env.local`** (if `.env.development` doesn't exist)
3. **`.env`** (fallback)

### How to Verify

Run any migration command and check the console output:

```bash
yarn migration:run

# Expected output:
# [ORM Config] Loading environment from: .env.development
```

### Environment File Structure

**Recommended setup:**

```
AGARO-MAIN-BE/
├── .env                  # Default/shared config (committed to git)
├── .env.development      # Development-specific (committed to git)
├── .env.local            # Local overrides (NOT committed - add to .gitignore)
├── .env.production       # Production-specific (committed to git)
└── .env.test             # Test environment (committed to git)
```

### .gitignore Recommendations

```gitignore
# Local environment overrides
.env.local
.env.*.local

# Keep these IN git (templates)
# .env
# .env.development
# .env.production
```

### Usage Examples

#### Development (default)
```bash
yarn migration:run
# Uses .env.development
```

#### Production
```bash
NODE_ENV=production yarn migration:run:prod
# Uses .env.production
```

#### Local Override
```bash
# Create .env.local with custom DB credentials
yarn migration:run
# Will use .env.local instead of .env.development
```

#### Specific Environment
```bash
NODE_ENV=staging yarn migration:run
# Will look for .env.staging, then fallback to .env.local, then .env
```

### Troubleshooting

#### Problem: "No .env file loaded"
**Solution:** Make sure at least one `.env` file exists in `AGARO-MAIN-BE/`

```bash
cd AGARO-MAIN-BE
ls -la | grep "\.env"
```

#### Problem: "Wrong database credentials"
**Solution:** Check which env file is being loaded:

```bash
yarn migration:run
# Look for: [ORM Config] Loading environment from: .env.xxx
```

#### Problem: "Want to use different env file"
**Solution:** Set `NODE_ENV` explicitly:

```bash
NODE_ENV=production yarn migration:run
```

Or create `.env.local` to override:

```bash
cp .env.development .env.local
# Edit .env.local with your custom values
yarn migration:run
```

### Related Commands

```bash
# Generate new migration
yarn migration:generate src/database/migrations/AddNewTable

# Run migrations
yarn migration:run

# Revert last migration
yarn migration:revert

# Production migrations
NODE_ENV=production yarn migration:run:prod
```

### Best Practices

1. **Keep sensitive data in `.env.local`** (not committed)
2. **Commit `.env.development` and `.env.production`** (templates)
3. **Always check console output** to verify which env file is loaded
4. **Use explicit `NODE_ENV`** in CI/CD pipelines:
   ```yaml
   # GitHub Actions example
   - name: Run migrations
     run: NODE_ENV=production yarn migration:run:prod
     env:
       DB_HOST: ${{ secrets.DB_HOST }}
   ```

### Windows Users

If you're on Windows, use `cross-env`:

```bash
npm install --save-dev cross-env
```

Update `package.json`:

```json
{
  "migration:run": "cross-env NODE_ENV=development ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d ./ormconfig.ts"
}
```

---

## Summary

✅ **Fixed**: Environment loading with fallback logic  
✅ **Added**: Console logging to show which env file is used  
✅ **Updated**: All migration scripts to set `NODE_ENV` explicitly  
✅ **Supports**: `.env.development`, `.env.local`, `.env` with priority order  

You can now run `yarn migration:run` and it will automatically load the correct environment! 🚀
