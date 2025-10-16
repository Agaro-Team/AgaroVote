/**
 * SIWE Authentication Middleware
 *
 * React Router v7 middleware for protecting routes with SIWE authentication.
 * Checks for valid JWT token in cookies and makes auth state available to loaders/actions.
 */
import { type MiddlewareFunction, replace } from 'react-router';
import { decodeAuthToken, getAuthToken } from '~/lib/auth/auth.server';

import { authContext } from './auth-context';

/**
 * SIWE Auth Middleware
 *
 * Requires authentication - redirects to home if not authenticated
 *
 * @example
 * ```ts
 * export const middleware = [siweAuthMiddleware];
 * ```
 */
export const siweAuthMiddleware: MiddlewareFunction = async ({ request, context }) => {
  const token = await getAuthToken(request);

  if (!token) {
    throw replace('/?error=authentication-required');
  }

  const payload = decodeAuthToken(token);

  if (!payload) {
    throw replace('/?error=invalid-token');
  }

  // Check token expiration
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw replace('/?error=token-expired');
  }

  // Store auth state in context for loaders/actions
  context.set(authContext, {
    isAuthenticated: true,
    walletAddress: payload.walletAddress,
    token,
  });
};

/**
 * Optional SIWE Auth Middleware
 *
 * Doesn't redirect - just stores auth state if available
 * Useful for routes that show different content based on auth state
 *
 * @example
 * ```ts
 * export const middleware = [optionalSiweAuthMiddleware];
 * ```
 */
export const optionalSiweAuthMiddleware: MiddlewareFunction = async ({ request, context }) => {
  const token = await getAuthToken(request);

  if (token) {
    const payload = decodeAuthToken(token);

    if (payload && (!payload.exp || payload.exp * 1000 >= Date.now())) {
      context.set(authContext, {
        isAuthenticated: true,
        walletAddress: payload.walletAddress,
        token,
      });
      return;
    }
  }

  // Not authenticated or invalid token
  context.set(authContext, {
    isAuthenticated: false,
  });
};
