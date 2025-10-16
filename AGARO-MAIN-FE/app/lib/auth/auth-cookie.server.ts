import { createCookie } from 'react-router';

/**
 * Authentication Cookie Configuration
 *
 * Uses React Router's native cookie system for JWT storage
 * Reference: https://reactrouter.com/explanation/sessions-and-cookies
 */
export const authCookie = createCookie('agaro_auth_token', {
  maxAge: 604_800, // 7 days (matches backend JWT expiry)
  path: '/',
  sameSite: 'lax',
  httpOnly: false, // Must be false for client-side access (API calls)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  secrets: [process.env.COOKIE_SECRET || 'dev-secret-change-in-production'],
});
