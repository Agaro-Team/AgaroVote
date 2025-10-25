# 🎯 How to Use SIWE Authentication - Practical Guide

## Quick Reference

**Authentication is now automatic!** When users connect their wallet, they're automatically prompted to sign in via SIWE.

---

## 📝 Step-by-Step Usage

### 1. Environment Setup

Create `.env` file:

```env
VITE_AGARO_VOTE_API_ENTRYPOINT=http://localhost:3000/api/v1
COOKIE_SECRET=your-secret-min-32-chars
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 2. Using the Authenticated Wallet Button

**Replace your existing wallet connect button with:**

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

**What happens:**
1. User clicks "Connect Wallet"
2. Selects wallet (MetaMask, WalletConnect, etc.)
3. Wallet connects via Wagmi
4. **Automatically** triggers SIWE sign-in
5. User signs message in wallet
6. Cookie is set, redirects to dashboard

---

### 3. Protecting Routes with Middleware

**Apply to any protected route:**

```tsx
// app/routes/dashboard/some-page/page.tsx
import { siweAuthMiddleware, authContext } from '~/lib/middleware/auth';

// Step 1: Add middleware export
export const middleware = [siweAuthMiddleware];

// Step 2: Access auth in loader
export async function loader({ context }) {
  const auth = context.get(authContext);
  
  // auth.isAuthenticated === true (guaranteed by middleware)
  // auth.walletAddress === "0x..." (authenticated wallet)
  // auth.token === "eyJ..." (JWT token)
  
  return {
    wallet: auth.walletAddress,
  };
}

// Step 3: Use in component
export default function MyPage({ loaderData }) {
  return <div>Welcome {loaderData.wallet}</div>;
}
```

**If user is not authenticated:**
- Middleware automatically redirects to `/?error=authentication-required`

---

### 4. Making API Calls

#### Option A: Client-Side API Calls (in Components)

```tsx
import { authenticatedApi } from '~/lib/api/authenticated-client';

export default function CreatePollForm() {
  async function handleSubmit(formData) {
    try {
      // Token automatically included from cookie
      const response = await authenticatedApi.post('/polls', {
        title: formData.title,
        creatorWalletAddress: formData.wallet,
        // ... other fields
      });
      
      console.log('Poll created:', response.data);
    } catch (error) {
      console.error('Error:', error);
      // 401 errors automatically trigger sign-out
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Option B: Server-Side API Calls (in Loaders/Actions)

```tsx
import { authContext } from '~/lib/middleware/auth';

export const middleware = [siweAuthMiddleware];

export async function loader({ context }) {
  const auth = context.get(authContext);
  
  // Make authenticated request
  const response = await fetch('http://localhost:3000/api/v1/polls', {
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const polls = await response.json();
  return { polls, wallet: auth.walletAddress };
}
```

---

### 5. Optional Authentication (Public Routes)

For routes that show different content based on auth state:

```tsx
import { optionalSiweAuthMiddleware, authContext } from '~/lib/middleware/auth';

export const middleware = [optionalSiweAuthMiddleware];

export async function loader({ context }) {
  const auth = context.get(authContext);
  
  if (auth.isAuthenticated) {
    // Load user-specific data
    const myPolls = await fetchMyPolls(auth.walletAddress);
    return { user: auth.walletAddress, polls: myPolls };
  } else {
    // Load public data
    const publicPolls = await fetchPublicPolls();
    return { user: null, polls: publicPolls };
  }
}

export default function HomePage({ loaderData }) {
  return (
    <div>
      {loaderData.user ? (
        <h1>Welcome back, {loaderData.user}</h1>
      ) : (
        <h1>Welcome, visitor!</h1>
      )}
    </div>
  );
}
```

---

### 6. Sign Out

**Method 1: Form (Recommended)**

```tsx
import { Form } from 'react-router';

export function SignOutButton() {
  return (
    <Form method="post" action="/auth/signout">
      <button type="submit">Sign Out</button>
    </Form>
  );
}
```

**Method 2: Programmatic**

```tsx
import { useNavigate } from 'react-router';

export function SignOutButton() {
  const navigate = useNavigate();
  
  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' });
    navigate('/');
  }
  
  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

---

## 🔧 Middleware Patterns

### Pattern 1: Authentication Required

```tsx
import { siweAuthMiddleware } from '~/lib/middleware/auth';

export const middleware = [siweAuthMiddleware];
```

**Use for:**
- Creating polls
- Casting votes
- User settings
- Any write operations

### Pattern 2: Optional Authentication

```tsx
import { optionalSiweAuthMiddleware } from '~/lib/middleware/auth';

export const middleware = [optionalSiweAuthMiddleware];
```

**Use for:**
- Home page
- Poll listings (show "my polls" if authenticated)
- Public content with personalization

### Pattern 3: Combined (Wallet + Auth)

```tsx
import { walletAuthMiddleware } from '~/lib/middleware/auth';
import { siweAuthMiddleware } from '~/lib/middleware/auth';

// Executes in order
export const middleware = [
  walletAuthMiddleware,  // First: Check wallet connected
  siweAuthMiddleware,    // Second: Check authenticated
];
```

**Use for:**
- Maximum security
- Critical operations
- Admin functions

---

## 🚨 Common Errors & Solutions

### Error: "authentication-required"

**Cause:** User is not authenticated

**Solution:**
```tsx
// User needs to connect wallet and sign in
<WalletConnectAuthButton />
```

### Error: "invalid-token"

**Cause:** JWT is malformed or tampered with

**Solution:**
```tsx
// Sign out and reconnect
await fetch('/auth/signout', { method: 'POST' });
```

### Error: "token-expired"

**Cause:** JWT has expired (> 7 days old)

**Solution:**
- User needs to sign in again
- Will happen automatically on next wallet connection

### 401 Unauthorized in API Calls

**Cause:** Token is invalid or expired

**Automatic handling:**
- `authenticatedApi` interceptor catches 401
- Automatically calls `/auth/signout`
- Redirects to home with error message

**No manual handling needed!**

---

## 💡 Pro Tips

### 1. Access Auth State Anywhere in Route

```tsx
export async function loader({ context }) {
  const auth = context.get(authContext);
  // Use auth.walletAddress, auth.token
}

export async function action({ context }) {
  const auth = context.get(authContext);
  // Use auth.walletAddress, auth.token
}
```

### 2. Validate Wallet Ownership

Always verify wallet addresses match:

```tsx
export async function action({ context, request }) {
  const auth = context.get(authContext);
  const formData = await request.formData();
  const requestWallet = formData.get('walletAddress');
  
  if (requestWallet !== auth.walletAddress) {
    throw new Error('Wallet mismatch');
  }
  
  // Proceed safely
}
```

### 3. Compose Multiple Middleware

```tsx
import { walletAuthMiddleware, siweAuthMiddleware } from '~/lib/middleware/auth';

// Both middleware run in order
export const middleware = [
  walletAuthMiddleware,   // Ensures wallet connected
  siweAuthMiddleware,     // Ensures authenticated
];
```

### 4. Debug Auth State

```tsx
export async function loader({ context }) {
  const auth = context.get(authContext);
  console.log('Auth state:', auth);
  // { isAuthenticated: true, walletAddress: "0x...", token: "eyJ..." }
  
  return { auth };
}
```

---

## 📖 Real-World Examples

### Example 1: Create Poll Page

```tsx
import { siweAuthMiddleware, authContext } from '~/lib/middleware/auth';
import { authenticatedApi } from '~/lib/api/authenticated-client';

export const middleware = [siweAuthMiddleware];

export async function loader({ context }) {
  const auth = context.get(authContext);
  return { walletAddress: auth.walletAddress };
}

export async function action({ request, context }) {
  const auth = context.get(authContext);
  const formData = await request.formData();
  
  const pollData = {
    title: formData.get('title'),
    creatorWalletAddress: auth.walletAddress, // Use authenticated wallet
    choices: JSON.parse(formData.get('choices') as string),
    // ... other fields
  };
  
  // API call includes token automatically
  const response = await authenticatedApi.post('/polls', pollData);
  
  return redirect(`/dashboard/voting-polls/${response.data.id}`);
}

export default function CreatePollPage({ loaderData }) {
  return (
    <div>
      <h1>Create Poll</h1>
      <p>Creating as: {loaderData.walletAddress}</p>
      <CreatePollForm />
    </div>
  );
}
```

### Example 2: Vote on Poll Page

```tsx
import { siweAuthMiddleware, authContext } from '~/lib/middleware/auth';
import { authenticatedApi } from '~/lib/api/authenticated-client';

export const middleware = [siweAuthMiddleware];

export async function loader({ params, context }) {
  const auth = context.get(authContext);
  
  // Fetch poll (public endpoint, but we know who's voting)
  const poll = await fetch(`http://localhost:3000/api/v1/polls/${params.id}`)
    .then(r => r.json());
  
  return { poll, voterWallet: auth.walletAddress };
}

export async function action({ request, context }) {
  const auth = context.get(authContext);
  const formData = await request.formData();
  
  const voteData = {
    pollId: formData.get('pollId'),
    choiceId: formData.get('choiceId'),
    voterWalletAddress: auth.walletAddress, // Authenticated wallet
    transactionHash: formData.get('txHash'),
    // ... other fields
  };
  
  // Cast vote (protected endpoint)
  await authenticatedApi.post('/votes', voteData);
  
  return redirect(`/dashboard/voting-polls/${voteData.pollId}`);
}
```

### Example 3: Public Homepage with Optional Auth

```tsx
import { optionalSiweAuthMiddleware, authContext } from '~/lib/middleware/auth';

export const middleware = [optionalSiweAuthMiddleware];

export async function loader({ context }) {
  const auth = context.get(authContext);
  
  if (auth.isAuthenticated) {
    // Show personalized content
    return { 
      user: auth.walletAddress,
      greeting: `Welcome back, ${auth.walletAddress}!`
    };
  }
  
  return {
    user: null,
    greeting: 'Welcome to AgaroVote'
  };
}

export default function HomePage({ loaderData }) {
  return (
    <div>
      <h1>{loaderData.greeting}</h1>
      {loaderData.user ? (
        <p>You're signed in as {loaderData.user}</p>
      ) : (
        <WalletConnectAuthButton />
      )}
    </div>
  );
}
```

---

## 🎓 Summary

**Three Things to Remember:**

1. **Add middleware** to protected routes
   ```tsx
   export const middleware = [siweAuthMiddleware];
   ```

2. **Access auth in loaders**
   ```tsx
   const auth = context.get(authContext);
   ```

3. **Use authenticated API client**
   ```tsx
   await authenticatedApi.post('/votes', data);
   ```

**That's it! Authentication is handled automatically.** 🎉

---

## 📚 Additional Documentation

- `SIWE_AUTH_SETUP.md` - Detailed setup guide
- `SIWE_IMPLEMENTATION_COMPLETE.md` - Technical implementation details
- `COMPREHENSIVE_AUTH_SUMMARY.md` - Complete overview

For backend documentation, see `AGARO-MAIN-BE/AUTHENTICATION_GUIDE.md`.

---

**Your authentication system is ready to use!** 🚀

