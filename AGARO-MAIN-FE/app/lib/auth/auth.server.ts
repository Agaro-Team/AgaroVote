import { jwtDecode } from 'jwt-decode';
import { redirect } from 'react-router';

import { authCookie } from './auth-cookie.server';

/**
 * JWT Payload Interface
 */
interface JwtPayload {
  walletAddress: string;
  iat?: number;
  exp?: number;
}

/**
 * Set authentication token in cookie
 * Call this from an action after successful SIWE verification
 *
 * @param token JWT token from backend
 * @returns Headers object with Set-Cookie header
 */
export async function setAuthToken(token: string) {
  return {
    'Set-Cookie': await authCookie.serialize(token),
  };
}

/**
 * Get authentication token from request cookie
 * Call this from middleware or loaders to check authentication
 *
 * @param request Request object
 * @returns JWT token or null if not found
 */
export async function getAuthToken(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get('Cookie');
  return await authCookie.parse(cookieHeader);
}

/**
 * Decode JWT token and extract wallet address
 *
 * @param token JWT token
 * @returns Decoded payload or null if invalid
 */
export function decodeAuthToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

/**
 * Require authentication for a route
 * Throws redirect if not authenticated
 *
 * @param request Request object
 * @returns Auth data (token and wallet address)
 */
export async function requireAuth(request: Request) {
  const token = await getAuthToken(request);

  if (!token) {
    throw redirect('/?error=authentication-required');
  }

  const payload = decodeAuthToken(token);

  if (!payload) {
    throw redirect('/?error=invalid-token');
  }

  // Check if token is expired
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw redirect('/?error=token-expired');
  }

  return {
    token,
    walletAddress: payload.walletAddress,
  };
}

/**
 * Sign out user by clearing the auth cookie
 *
 * @returns Headers object with expired Set-Cookie header
 */
export async function signOut() {
  return {
    'Set-Cookie': await authCookie.serialize('', { maxAge: 0 }),
  };
}
