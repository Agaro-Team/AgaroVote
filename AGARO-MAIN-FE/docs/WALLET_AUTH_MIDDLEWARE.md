# Wallet Authentication Middleware

## Overview

This guide explains how React Router v8 middleware is used to protect routes requiring wallet connection in the AgaroVote application. The middleware ensures that only users with connected wallets can access protected routes like `/dashboard` and `/counter`.

**Reference**: [React Router Middleware Guide](https://reactrouter.com/how-to/middleware)

## Architecture

The wallet authentication middleware follows React Router's middleware pattern, executing before route handlers (loaders/actions) to verify wallet connection state.

### Middleware Flow

```
Request → Middleware Chain → Route Handler → Response
          ↓
          Check Wallet Connection
          ↓
          - If connected: Store wallet state in context, continue
          - If not connected: Redirect to home page
```

## Files Structure

```
app/lib/middleware/
├── context.ts        # Context definitions for middleware
├── auth.ts          # Wallet authentication middleware
└── index.ts         # Exports

app/routes/
├── counter.tsx      # Protected with walletAuthMiddleware
└── dashboard/
    └── layout.tsx   # Protected with walletAuthMiddleware (covers all child routes)
```

## Implementation

### 1. Context Definition

**File**: `app/lib/middleware/context.ts`

Defines the `walletContext` to share wallet state between middleware and route handlers:

```ts
import { createContext } from 'react-router';

export interface WalletState {
  isConnected: boolean;
  address?: string;
}

export const walletContext = createContext<WalletState>();
```

### 2. Authentication Middleware

**File**: `app/lib/middleware/auth.ts`

#### `walletAuthMiddleware`

The main authentication middleware that:

1. Reads wagmi state from cookies
2. Checks if wallet is connected
3. Redirects to home page if not connected
4. Stores wallet state in context if connected

```ts
import { type RouterContextProvider, redirect } from 'react-router';
import { cookieToInitialState } from 'wagmi';
import { config } from '~/lib/web3/config';

import { walletContext } from './context';

export const walletAuthMiddleware = async (args: any) => {
  const { request, context } = args;

  // Get wagmi state from cookies
  const cookieHeader = request.headers.get('Cookie') || '';
  const initialState = cookieToInitialState(config, cookieHeader);

  // Check if wallet is connected
  const isConnected = !!initialState?.current;
  const address = initialState?.connections?.get(initialState.current!)?.accounts?.[0];

  if (!isConnected) {
    // Redirect to home page with error parameter
    throw redirect('/?error=wallet-required');
  }

  // Store wallet state in context
  context.set(walletContext, {
    isConnected,
    address,
  });

  // Continue to next middleware or route handler
  // (next() is called automatically when not explicitly called)
};
```

#### `optionalWalletMiddleware`

Similar to `walletAuthMiddleware` but doesn't enforce authentication:

```ts
export const optionalWalletMiddleware = async (args: any) => {
  const { request, context } = args;

  const cookieHeader = request.headers.get('Cookie') || '';
  const initialState = cookieToInitialState(config, cookieHeader);

  const isConnected = !!initialState?.current;
  const address = initialState?.connections?.get(initialState.current!)?.accounts?.[0];

  // Store wallet state without redirecting
  context.set(walletContext, {
    isConnected,
    address,
  });
};
```

### 3. Applying Middleware to Routes

#### Protecting a Single Route

**File**: `app/routes/counter.tsx`

```ts
import { CounterUI } from '~/components/counter-ui';
import { walletAuthMiddleware } from '~/lib/middleware';
import type { Route } from './+types/counter';

// Protect this route with wallet authentication
export const middleware: Route.MiddlewareFunction[] = [walletAuthMiddleware];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Counter Contract - AgaroVote' },
    { name: 'description', content: 'Interact with the Counter smart contract' },
  ];
}

export default function CounterPage() {
  return <CounterUI />;
}
```

#### Protecting Multiple Routes via Layout

**File**: `app/routes/dashboard/layout.tsx`

```ts
import { Outlet } from 'react-router';
import { AppSidebar } from '~/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import { walletAuthMiddleware } from '~/lib/middleware';
import type { Route } from './+types/layout';

// Protect ALL dashboard routes with wallet authentication
// This middleware runs for all child routes under /dashboard
export const middleware: Route.MiddlewareFunction[] = [walletAuthMiddleware];

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### 4. Using Wallet Context in Route Handlers

If you need to access wallet information in loaders or actions:

```ts
import { walletContext } from '~/lib/middleware';

import type { Route } from './+types/my-route';

export async function loader({ context }: Route.LoaderArgs) {
  const wallet = context.get(walletContext);

  console.log('Wallet connected:', wallet?.isConnected);
  console.log('Wallet address:', wallet?.address);

  // Use wallet state in your loader logic
  return { wallet };
}

export async function action({ context }: Route.ActionArgs) {
  const wallet = context.get(walletContext);

  // Use wallet state in your action logic
  if (wallet?.isConnected) {
    // Perform wallet-specific operations
  }
}
```

## Configuration

### Enable v8 Middleware

**File**: `react-router.config.ts`

```ts
import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  future: {
    v8_middleware: true, // Enable middleware support
  },
} satisfies Config;
```

## How It Works

### 1. Cookie-Based Wallet State

Wagmi stores wallet connection state in cookies, which are accessible on the server:

```ts
const cookieHeader = request.headers.get('Cookie') || '';
const initialState = cookieToInitialState(config, cookieHeader);
```

### 2. Connection Check

The middleware checks if a wallet is currently connected:

```ts
const isConnected = !!initialState?.current;
```

### 3. Redirect on Failure

If no wallet is connected, the user is redirected to the home page:

```ts
if (!isConnected) {
  throw redirect('/?error=wallet-required');
}
```

### 4. Context Storage

If connected, wallet state is stored in context for use by route handlers:

```ts
context.set(walletContext, {
  isConnected,
  address,
});
```

## Protected Routes

Currently protected routes:

| Route          | Middleware Location           | Scope                     |
| -------------- | ----------------------------- | ------------------------- |
| `/counter`     | `routes/counter.tsx`          | Single route              |
| `/dashboard/*` | `routes/dashboard/layout.tsx` | Layout + all child routes |

## Benefits

### ✅ Centralized Authentication

- Single source of truth for wallet authentication logic
- Reusable across multiple routes
- Easy to maintain and update

### ✅ Server-Side Protection

- Authentication happens on the server before rendering
- Prevents flash of unauthorized content
- SEO-friendly redirects

### ✅ Type-Safe Context

- Context API provides type-safe wallet state access
- TypeScript ensures correct usage throughout the app
- IntelliSense support for wallet properties

### ✅ Nested Middleware

- Layout middleware protects all child routes automatically
- No need to duplicate authentication logic
- Follows React Router's nested routing model

## Common Patterns

### Pattern 1: Optional Authentication

Show different content based on wallet connection without enforcing it:

```ts
export const middleware: Route.MiddlewareFunction[] = [optionalWalletMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const wallet = context.get(walletContext);

  if (wallet?.isConnected) {
    return { content: 'authenticated content' };
  } else {
    return { content: 'public content' };
  }
}
```

### Pattern 2: Conditional Middleware

Run middleware only for specific HTTP methods:

```ts
export const middleware: Route.MiddlewareFunction[] = [
  async ({ request, context }, next) => {
    // Only require auth for POST requests
    if (request.method === 'POST') {
      await walletAuthMiddleware({ request, context });
    }
    return next();
  },
];
```

### Pattern 3: Multiple Middleware

Chain multiple middleware functions:

```ts
export const middleware: Route.MiddlewareFunction[] = [
  walletAuthMiddleware,
  loggingMiddleware,
  analyticsMiddleware,
];
```

### Pattern 4: Middleware with Error Handling

```ts
export const safeAuthMiddleware = async (args: any) => {
  try {
    await walletAuthMiddleware(args);
  } catch (error) {
    // Log error
    console.error('Auth middleware error:', error);
    // Re-throw to maintain redirect behavior
    throw error;
  }
};
```

## Error Handling

### Redirect with Error Message

When authentication fails, users are redirected with an error parameter:

```ts
throw redirect('/?error=wallet-required');
```

You can handle this in your home page:

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get('error');

  return { error };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;

  if (error === 'wallet-required') {
    return (
      <div>
        <p>Please connect your wallet to access this page.</p>
        <WalletConnectButton />
      </div>
    );
  }

  // Normal home page content
}
```

## Testing

### Testing Protected Routes

```ts
import { createRemixStub } from '@remix-run/testing';

test('redirects when wallet not connected', async () => {
  const RemixStub = createRemixStub([
    {
      path: '/counter',
      Component: CounterPage,
      middleware: [walletAuthMiddleware],
    },
  ]);

  // Test without wallet cookie
  render(<RemixStub />);

  // Should redirect to home
  expect(window.location.pathname).toBe('/');
});
```

## Migration from Loader-Based Auth

**Before** (using loaders):

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const initialState = cookieToInitialState(config, request.headers.get('Cookie') || '');

  if (!initialState?.current) {
    throw redirect('/');
  }

  return null;
}
```

**After** (using middleware):

```ts
export const middleware: Route.MiddlewareFunction[] = [walletAuthMiddleware];
```

Benefits of migration:

- Less boilerplate code
- Reusable across routes
- Centralized authentication logic
- Context available to loaders/actions

## Debugging

### Enable Middleware Logging

```ts
export const walletAuthMiddleware = async (args: any) => {
  const { request, context } = args;

  console.log('🔒 Wallet Auth Middleware');
  console.log('- URL:', request.url);
  console.log('- Method:', request.method);

  const cookieHeader = request.headers.get('Cookie') || '';
  const initialState = cookieToInitialState(config, cookieHeader);

  console.log('- Connected:', !!initialState?.current);

  // ... rest of middleware
};
```

### Check Middleware Execution Order

```ts
export const middleware: Route.MiddlewareFunction[] = [
  async (args, next) => {
    console.log('1. Before auth');
    await walletAuthMiddleware(args);
    console.log('2. After auth');
    return next();
  },
];
```

## Best Practices

### ✅ DO

1. **Use middleware for authentication** - Cleaner than loader checks
2. **Apply at layout level** - Protect multiple routes at once
3. **Store wallet state in context** - Make it available to handlers
4. **Provide error feedback** - Redirect with error messages
5. **Test middleware behavior** - Ensure proper protection

### ❌ DON'T

1. **Don't duplicate auth logic** - Use shared middleware
2. **Don't skip middleware on sensitive routes** - Always protect
3. **Don't rely on client-side checks only** - Server-side is essential
4. **Don't forget to enable v8_middleware flag** - Required for middleware support
5. **Don't block non-sensitive routes** - Use optionally when appropriate

## Security Considerations

1. **Cookie Security**: Wagmi cookies should be HTTP-only and secure in production
2. **CSRF Protection**: Consider CSRF tokens for state-changing operations
3. **Rate Limiting**: Implement rate limiting for protected routes
4. **Logging**: Log authentication attempts for security monitoring
5. **Session Management**: Consider session timeouts for inactive wallets

## Related Documentation

- [React Router Middleware Guide](https://reactrouter.com/how-to/middleware)
- [Multi-Chain Optimization](./MULTI_CHAIN_OPTIMIZATION.md)
- [Web3 Setup](./WEB3_SETUP.md)
- [Web3 Architecture](./WEB3_ARCHITECTURE.md)

## Summary

React Router v8 middleware provides a powerful, centralized way to protect routes requiring wallet authentication:

- ✅ **Server-side protection** before rendering
- ✅ **Reusable authentication logic**
- ✅ **Type-safe context** for wallet state
- ✅ **Nested routing support** via layout middleware
- ✅ **Clean, maintainable code**

The wallet authentication middleware ensures that only users with connected wallets can access protected routes like `/dashboard` and `/counter`, providing a secure foundation for your Web3 application.
