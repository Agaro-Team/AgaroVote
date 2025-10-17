/**
 * Auth Module Exports
 *
 * Central export point for all authentication-related functionality
 */

// Context and Provider
export {
  AuthProvider,
  useAuth,
  useAuthUser,
  useAuthToken,
  useRequireAuth,
  useAuthStatus,
} from './auth-context';

export type { AuthState, AuthContextValue } from './auth-context';

// SIWE Client
export { signInWithEthereum, parseAuthError } from './siwe-client';
