# 🚀 AgaroVote Backend - Quick Start

## What's New? 🔐 Authentication & Security

The backend now has **complete Web3 authentication** using SIWE (Sign-In With Ethereum). This means:

✅ **Cryptographic proof** of wallet ownership  
✅ **No password** required  
✅ **Industry-standard** security (same as OpenSea, Uniswap)  
✅ **Rate limiting** to prevent spam  
✅ **Global authentication** - routes protected by default  

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd AGARO-MAIN-BE
yarn install
```

### 2. Configure Environment

Create `.env` file (or copy from `.env.example`):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=agaro_vote

# JWT Authentication (IMPORTANT!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
APP_PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**⚠️ IMPORTANT:** Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run Database Migrations

```bash
# Run all migrations (including auth_nonces table)
yarn migration:run
```

### 4. Start the Server

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

Server will be available at: `http://localhost:3000/api/v1`

---

## API Authentication

### How It Works

```
1. User connects wallet → Frontend
2. Request nonce → POST /auth/nonce
3. Sign message → Wallet signs with private key
4. Verify signature → POST /auth/verify
5. Receive JWT token → Use in all requests
6. Authenticated requests → Authorization: Bearer <token>
```

### Quick Test

#### 1. Get a nonce

```bash
curl -X POST http://localhost:3000/api/v1/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}'
```

Response:
```json
{
  "nonce": "abc123...",
  "expiresAt": "2024-01-01T12:05:00.000Z"
}
```

#### 2. Sign the message

Use your wallet (MetaMask, etc.) to sign a SIWE message with the nonce.

#### 3. Verify signature

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "message":"... SIWE message ...",
    "signature":"0x..."
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "expiresIn": 604800
}
```

#### 4. Use the token

```bash
curl -X POST http://localhost:3000/api/v1/polls \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Poll",
    "creatorWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    ...
  }'
```

---

## Endpoint Security

### Public Endpoints (No Auth Required)

- `GET /health` - Health check
- `GET /polls` - List polls
- `GET /polls/:id` - Get poll details
- `GET /votes/stats/:pollId` - Vote statistics
- `POST /auth/nonce` - Get authentication nonce
- `POST /auth/verify` - Verify signature

### Protected Endpoints (Auth Required)

- `POST /polls` - Create poll
- `PUT /polls/:id` - Update poll
- `DELETE /polls/:id` - Delete poll
- `POST /votes` - Cast vote

**All protected endpoints require:**
```
Authorization: Bearer <your-jwt-token>
```

---

## Rate Limiting

Default limits:
- **100 requests per minute** per IP address
- Applies to all endpoints
- Customizable in `.env`:

```env
THROTTLE_TTL=60000  # 1 minute in milliseconds
THROTTLE_LIMIT=100   # Max requests per window
```

---

## Development

### Project Structure

```
src/
├── modules/
│   ├── auth/              # 🔐 NEW: Authentication module
│   │   ├── domain/
│   │   │   ├── entities/nonce.entity.ts
│   │   │   └── repositories/
│   │   ├── application/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── jwt.service.ts
│   │   │   └── dto/
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   └── strategies/jwt.strategy.ts
│   │   └── presentation/
│   │       ├── controllers/auth.controller.ts
│   │       ├── guards/jwt-auth.guard.ts
│   │       └── decorators/
│   │           ├── public.decorator.ts
│   │           └── wallet.decorator.ts
│   ├── poll/
│   ├── vote/
│   └── user/
├── database/
│   └── migrations/
│       └── 1760550000000-AddAuthNoncesTable.ts  # 🔐 NEW
└── app.module.ts  # 🔐 UPDATED: Global auth guard
```

### Using Authentication in Controllers

#### Mark routes as public

```typescript
import { Public } from '@modules/auth/presentation/decorators/public.decorator';

@Controller('polls')
export class PollController {
  @Public()  // Anyone can access
  @Get()
  async findAll() {
    return this.pollService.findAll();
  }
}
```

#### Get authenticated wallet

```typescript
import { Wallet } from '@modules/auth/presentation/decorators/wallet.decorator';

@Controller('polls')
export class PollController {
  @Post()  // Protected by default
  async create(
    @Wallet() walletAddress: string,  // Automatically extracted from JWT
    @Body() dto: CreatePollDto
  ) {
    // walletAddress is guaranteed to be authenticated
    return this.pollService.create(walletAddress, dto);
  }
}
```

---

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

---

## Common Issues

### "JWT_SECRET not defined"

**Solution:** Add `JWT_SECRET` to your `.env` file

### "Invalid or expired nonce"

**Solution:** Request a new nonce (nonces expire after 5 minutes)

### "401 Unauthorized"

**Solution:** 
1. Check token is included: `Authorization: Bearer <token>`
2. Verify token hasn't expired
3. Re-authenticate if needed

### "Database connection failed"

**Solution:** 
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Create database if it doesn't exist: `createdb agaro_vote`

---

## Documentation

- **Authentication Guide**: `AUTHENTICATION_GUIDE.md` - Complete authentication documentation
- **Security Implementation**: `SECURITY_IMPLEMENTATION.md` - Security architecture details
- **API Documentation**: See inline comments in controllers

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Set strong `JWT_SECRET` (min 32 random characters)
- [ ] Configure `CORS_ORIGIN` to your production domain
- [ ] Enable HTTPS
- [ ] Run database migrations
- [ ] Set `NODE_ENV=production`
- [ ] Configure rate limiting based on traffic
- [ ] Set up monitoring and logging
- [ ] Test authentication flow end-to-end

### Environment Variables

```env
NODE_ENV=production
JWT_SECRET=<STRONG_RANDOM_SECRET>
JWT_EXPIRES_IN=7d
DB_HOST=<production-db-host>
CORS_ORIGIN=https://your-domain.com
```

---

## Next Steps

1. ✅ Backend authentication is ready
2. 🔄 Update frontend to implement SIWE flow (see `AUTHENTICATION_GUIDE.md`)
3. 🔄 Test end-to-end authentication
4. 🔄 Deploy to production

---

## Support

- **GitHub Issues**: For bugs and feature requests
- **Documentation**: `AUTHENTICATION_GUIDE.md` for detailed auth flow
- **Security**: `SECURITY_IMPLEMENTATION.md` for security details

---

**The backend is now secure and ready for production! 🎉**

