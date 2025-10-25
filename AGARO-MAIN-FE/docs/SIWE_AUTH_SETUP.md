# SIWE Authentication Setup Guide

## Environment Variables

Create a `.env` file in the root of `AGARO-MAIN-FE` with the following variables:

```env
# API Configuration
VITE_AGARO_VOTE_API_ENTRYPOINT=http://localhost:3000/api/v1

# Cookie Secret (IMPORTANT: Change in production, min 32 characters)
COOKIE_SECRET=change-this-to-a-strong-random-secret-in-production-min-32-chars

# Environment
NODE_ENV=development
```

### Generate Cookie Secret for Production

```bash
# Generate a secure random secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Usage

### 1. Using the Authenticated Wallet Connect Button

Replace your existing wallet connect button with the new authenticated version:

```tsx
import { WalletConnectAuthButton } from '~/components/auth/wallet-connect-auth-button';

export default function MyPage() {
  return (
    <div>
      <WalletConnectAuthButton />
    </div>
  );
}
```

### 2. Protecting Routes with Middleware

Apply SIWE authentication middleware to protected routes:

```tsx
// app/routes/dashboard/some-protected-route/page.tsx
import { siweAuthMiddleware, authContext } from '~/lib/middleware/auth';
import type { Route } from './+types/page';

// Apply middleware
export const middleware = [siweAuthMiddleware];

// Access auth state in loader
export async function loader({ context }: Route.LoaderArgs) {
  const auth = context.get(authContext);
  
  // auth.isAuthenticated is guaranteed true (middleware redirected if not)
  // auth.walletAddress contains the authenticated wallet
  // auth.token contains the JWT for API calls
  
  return { walletAddress: auth.walletAddress };
}

export default function ProtectedPage({ loaderData }: Route.ComponentProps) {
  return <div>Welcome {loaderData.walletAddress}</div>;
}
```

### 3. Making Authenticated API Calls (Client-Side)

Use the authenticated API client in components:

```tsx
import { authenticatedApi } from '~/lib/api/authenticated-client';

async function createPoll(data: PollData) {
  const response = await authenticatedApi.post('/polls', data);
  return response.data;
}

async function castVote(voteData: VoteData) {
  const response = await authenticatedApi.post('/votes', voteData);
  return response.data;
}
```

### 4. Making Authenticated API Calls (Server-Side in Loaders)

Use the token from auth context in loaders:

```tsx
export async function loader({ context }: Route.LoaderArgs) {
  const auth = context.get(authContext);
  
  // Call backend with JWT
  const response = await fetch('http://localhost:3000/api/v1/polls', {
    headers: {
      'Authorization': `Bearer ${auth.token}`,
    },
  });
  
  return json(await response.json());
}
```

### 5. Optional Authentication (Public Routes with Auth State)

For routes that show different content based on auth state but don't require it:

```tsx
import { optionalSiweAuthMiddleware, authContext } from '~/lib/middleware/auth';

export const middleware = [optionalSiweAuthMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const auth = context.get(authContext);
  
  if (auth.isAuthenticated) {
    // Load user-specific data
    return { user: auth.walletAddress, polls: await getMyPolls() };
  } else {
    // Load public data
    return { user: null, polls: await getPublicPolls() };
  }
}
```

### 6. Sign Out

Use the sign-out route or create a sign-out button:

```tsx
import { Form } from 'react-router';

function SignOutButton() {
  return (
    <Form method="post" action="/auth/signout">
      <button type="submit">Sign Out</button>
    </Form>
  );
}
```

Or programmatically:

```tsx
async function handleSignOut() {
  await fetch('/auth/signout', { method: 'POST' });
  window.location.href = '/';
}
```

## Authentication Flow

1. User clicks "Connect Wallet"
2. Wallet connects via Wagmi
3. Automatically triggers SIWE sign-in
4. User signs message in wallet
5. Frontend submits to `/auth/siwe` action
6. Backend verifies signature
7. Backend returns JWT token
8. Action sets signed cookie
9. Redirects to `/dashboard/voting-polls`

## Testing

1. **Connect & Auth**: Click "Connect Wallet" → should prompt signature → redirect to dashboard
2. **Persistence**: Refresh page while on dashboard → should stay authenticated
3. **API Calls**: Create poll or cast vote → should include Bearer token automatically
4. **Token Expiry**: Wait 7 days or manually clear cookie → should redirect with error
5. **Sign Out**: Click disconnect → should clear cookie and redirect home

## Troubleshooting

### "authentication-required" error
- Cookie was cleared or expired
- User needs to reconnect wallet

### "invalid-token" error
- JWT token is malformed
- Clear cookies and reconnect

### "token-expired" error
- JWT has expired (7 days)
- User needs to sign in again

### 401 errors in API calls
- Token is invalid or expired
- Will auto-redirect to home

## Security Notes

- Cookie is signed with `COOKIE_SECRET` (tamper-proof)
- `httpOnly: false` allows client-side reading for API calls
- `sameSite: 'lax'` prevents CSRF attacks
- `secure: true` in production (HTTPS only)
- Token automatically expires after 7 days
- Server validates JWT on every request

