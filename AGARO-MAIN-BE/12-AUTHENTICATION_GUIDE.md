# 🔐 AgaroVote Authentication Guide

## Overview

AgaroVote uses **SIWE (Sign-In With Ethereum)** for Web3 authentication, combined with JWT tokens for session management. This provides cryptographic proof of wallet ownership without traditional username/password authentication.

---

## 🏗️ Architecture

### Authentication Flow

```
┌─────────┐                 ┌──────────┐                 ┌──────────┐
│ Frontend│                 │  Backend │                 │ Blockchain│
└────┬────┘                 └─────┬────┘                 └─────┬────┘
     │                            │                             │
     │  1. Connect Wallet         │                             │
     │───────────────────────────>│                             │
     │                            │                             │
     │  2. Request Nonce          │                             │
     │───────────────────────────>│                             │
     │  POST /auth/nonce          │                             │
     │                            │                             │
     │  3. Return Nonce           │                             │
     │<───────────────────────────│                             │
     │  { nonce: "abc123..." }    │                             │
     │                            │                             │
     │  4. Sign Message           │                             │
     │───────────────────────────────────────────────────────>│
     │  (User signs with wallet)  │                             │
     │                            │                             │
     │  5. Return Signature       │                             │
     │<───────────────────────────────────────────────────────│
     │                            │                             │
     │  6. Verify Signature       │                             │
     │───────────────────────────>│                             │
     │  POST /auth/verify         │                             │
     │                            │                             │
     │  7. Return JWT Token       │                             │
     │<───────────────────────────│                             │
     │  { accessToken: "..." }    │                             │
     │                            │                             │
     │  8. Authenticated Requests │                             │
     │───────────────────────────>│                             │
     │  Authorization: Bearer ... │                             │
     │                            │                             │
```

---

## 🚀 Backend Implementation

### 1. Environment Variables

Add to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### 2. Run Database Migration

```bash
yarn migration:run
```

This creates the `auth_nonces` table for storing authentication nonces.

### 3. Protected Routes

The authentication guard is applied **globally**. Use decorators to control access:

#### Public Routes (No Authentication Required)

```typescript
import { Public } from '@modules/auth/presentation/decorators/public.decorator';

@Controller('polls')
export class PollController {
  @Public()
  @Get()
  async findAll() {
    // Anyone can access this
  }
}
```

#### Protected Routes (Authentication Required)

```typescript
import { Wallet } from '@modules/auth/presentation/decorators/wallet.decorator';

@Controller('polls')
export class PollController {
  @Post()
  async create(
    @Wallet() walletAddress: string,
    @Body() dto: CreatePollDto
  ) {
    // Only authenticated users can access
    // walletAddress is automatically extracted from JWT
  }
}
```

### 4. Wallet Address Validation

Always verify that the authenticated wallet matches the requested action:

```typescript
@Post()
async castVote(
  @Wallet() walletAddress: string,
  @Body() dto: CastVoteDto
) {
  // Verify wallet ownership
  if (dto.voterWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new ForbiddenException('You can only vote with your own wallet');
  }
  
  // Process vote...
}
```

---

## 💻 Frontend Integration

### 1. Install Dependencies

```bash
npm install siwe ethers
# or
yarn add siwe ethers
```

### 2. Create Authentication Service

```typescript
// lib/auth/siwe-auth.ts
import { SiweMessage } from 'siwe';
import { BrowserProvider } from 'ethers';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export class SiweAuthService {
  private accessToken: string | null = null;

  /**
   * Authenticate user with SIWE
   */
  async signIn(walletAddress: string, provider: BrowserProvider): Promise<string> {
    try {
      // Step 1: Get nonce from backend
      const nonceResponse = await fetch(`${API_BASE_URL}/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce, expiresAt } = await nonceResponse.json();

      // Step 2: Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: walletAddress,
        statement: 'Sign in to AgaroVote',
        uri: window.location.origin,
        version: '1',
        chainId: await provider.getNetwork().then(n => n.chainId),
        nonce,
        expirationTime: expiresAt,
      });

      const messageText = message.prepareMessage();

      // Step 3: Request user signature
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageText);

      // Step 4: Verify signature and get JWT
      const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          signature,
          walletAddress,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify signature');
      }

      const { accessToken } = await verifyResponse.json();
      
      // Store token
      this.accessToken = accessToken;
      localStorage.setItem('siwe_token', accessToken);
      
      return accessToken;
    } catch (error) {
      console.error('SIWE authentication failed:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  signOut() {
    this.accessToken = null;
    localStorage.removeItem('siwe_token');
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('siwe_token');
    }
    return this.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const siweAuth = new SiweAuthService();
```

### 3. Update API Client

Add JWT token to all requests:

```typescript
// lib/api/api.ts
import { siweAuth } from '../auth/siwe-auth';

export const createApiClient = (options?: CreateAxiosDefaults): AxiosInstance => {
  const client = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  // Request interceptor - Add JWT token
  client.interceptors.request.use(
    (config) => {
      const token = siweAuth.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle 401 errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        siweAuth.signOut();
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );

  return client;
};
```

### 4. React Hook for Authentication

```typescript
// hooks/use-siwe-auth.ts
import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { siweAuth } from '~/lib/auth/siwe-auth';

export function useSiweAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(siweAuth.isAuthenticated());
  }, []);

  const signIn = async (walletAddress: string, provider: BrowserProvider) => {
    setIsLoading(true);
    try {
      await siweAuth.signIn(walletAddress, provider);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    siweAuth.signOut();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  };
}
```

### 5. Update Wallet Connect Component

```typescript
// components/wallet-connect-button.tsx
import { useSiweAuth } from '~/hooks/use-siwe-auth';
import { useWeb3Wallet } from '~/hooks/use-web3';
import { BrowserProvider } from 'ethers';

export function WalletConnectButton() {
  const { address, isConnected, connect, disconnect } = useWeb3Wallet();
  const { isAuthenticated, signIn, signOut } = useSiweAuth();

  const handleConnect = async (connectorId: string) => {
    // Step 1: Connect wallet
    await connect(connectorId, {
      onSuccess: async () => {
        // Step 2: Authenticate with SIWE
        if (address) {
          const provider = new BrowserProvider(window.ethereum);
          const success = await signIn(address, provider);
          
          if (success) {
            // Redirect to dashboard
            navigate('/dashboard');
          }
        }
      },
    });
  };

  const handleDisconnect = () => {
    disconnect();
    signOut();
    navigate('/');
  };

  // ... rest of component
}
```

---

## 🔒 Security Best Practices

### 1. Nonce Management

- ✅ Nonces are single-use only
- ✅ Nonces expire after 5 minutes
- ✅ Used nonces are marked to prevent replay attacks

### 2. JWT Tokens

- ✅ Tokens are signed with a secret key
- ✅ Default expiry: 7 days (configurable)
- ✅ Tokens are validated on every request

### 3. Rate Limiting

- ✅ Global rate limit: 100 requests/minute per IP
- ✅ Prevents spam and DDoS attacks
- ✅ Configurable via environment variables

### 4. Wallet Verification

Always verify wallet addresses match:

```typescript
// ❌ BAD - Trusting client input
@Post('create-poll')
async create(@Body() dto: CreatePollDto) {
  return this.pollService.create(dto.creatorWalletAddress);
}

// ✅ GOOD - Verifying authenticated wallet
@Post('create-poll')
async create(
  @Wallet() walletAddress: string,
  @Body() dto: CreatePollDto
) {
  if (dto.creatorWalletAddress !== walletAddress) {
    throw new ForbiddenException('Wallet mismatch');
  }
  return this.pollService.create(walletAddress);
}
```

---

## 📋 API Endpoints

### Authentication Endpoints

#### Get Nonce

```http
POST /api/v1/auth/nonce
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "nonce": "abc123xyz789...",
  "expiresAt": "2024-01-01T12:05:00.000Z"
}
```

#### Verify Signature

```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "message": "localhost wants you to sign in with your Ethereum account...",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "expiresIn": 604800
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:

```http
POST /api/v1/polls
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "My Poll",
  "creatorWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

---

## 🧪 Testing

### Manual Testing with cURL

```bash
# 1. Get nonce
NONCE_RESPONSE=$(curl -X POST http://localhost:3000/api/v1/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}')

echo $NONCE_RESPONSE

# 2. Sign message with wallet (use MetaMask or similar)

# 3. Verify signature
TOKEN_RESPONSE=$(curl -X POST http://localhost:3000/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "message":"...",
    "signature":"0x..."
  }')

echo $TOKEN_RESPONSE

# 4. Use token in requests
curl -X POST http://localhost:3000/api/v1/polls \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Poll","creatorWalletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}'
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid or expired nonce"

**Cause:** Nonce was already used or expired (> 5 minutes old)

**Solution:** Request a new nonce

#### 2. "Invalid signature"

**Cause:** Message was modified or signature is incorrect

**Solution:** 
- Ensure message format matches SIWE spec
- Verify you're signing with the correct wallet
- Check chainId matches

#### 3. "401 Unauthorized"

**Cause:** JWT token is missing, invalid, or expired

**Solution:**
- Check token is included in Authorization header
- Verify token hasn't expired (check JWT_EXPIRES_IN)
- Re-authenticate if needed

#### 4. "You can only vote with your own wallet address"

**Cause:** Wallet address in request body doesn't match authenticated wallet

**Solution:** Ensure frontend sends the same wallet address that was authenticated

---

## 📚 Additional Resources

- [SIWE Specification](https://eips.ethereum.org/EIPS/eip-4361)
- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication#jwt-functionality)
- [Passport.js Documentation](http://www.passportjs.org/docs/)

---

## 🔄 Migration from No Auth

If you have existing data without authentication:

1. Run the migration: `yarn migration:run`
2. Update frontend to include authentication flow
3. Gradually enable authentication on sensitive endpoints
4. Use `@Public()` decorator for backward compatibility during transition

---

## 📝 Notes

- All wallet addresses are stored in lowercase
- Nonces are automatically cleaned up after expiration
- Rate limiting can be customized per endpoint using `@SkipThrottle()` or `@Throttle()`
- For production, ensure JWT_SECRET is a strong, random value

