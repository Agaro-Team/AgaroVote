/**
 * Auth Context and Provider
 *
 * Manages authentication state and handles SIWE flow with wallet integration.
 * Automatically triggers re-authentication when wallet changes.
 */
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getAuthToken } from '../utils/cookie.client';
import { parseAuthError, signInWithEthereum } from './siwe-client';

/**
 * JWT Payload Interface
 */
interface JwtPayload {
  walletAddress: string;
  iat?: number;
  exp?: number;
}

/**
 * Auth State
 */
export interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Authenticated wallet address */
  walletAddress?: string;
  /** JWT token */
  token?: string;
  /** Loading state during authentication */
  isAuthenticating: boolean;
  /** Error during authentication */
  error?: string;
}

/**
 * Auth Context Value
 */
export interface AuthContextValue extends AuthState {
  /** Manually trigger SIWE authentication */
  authenticate: () => Promise<void>;
  /** Sign out user */
  signOut: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
  /** Auto-trigger SIWE when wallet connects (default: true) */
  autoAuth?: boolean;
  /** Re-authenticate when wallet changes (default: true) */
  reAuthOnWalletChange?: boolean;
}

/**
 * Auth Provider Component
 *
 * Wraps the application and provides authentication state.
 * Handles wallet change detection and automatic SIWE flow.
 *
 * @example
 * ```tsx
 * <AuthProvider autoAuth={true} reAuthOnWalletChange={true}>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({
  children,
  autoAuth = true,
  reAuthOnWalletChange = true,
}: AuthProviderProps) {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize from cookie (only on client-side)
    if (typeof window === 'undefined') {
      // Server-side: return default unauthenticated state
      return {
        isAuthenticated: false,
        isAuthenticating: false,
      };
    }

    const token = getAuthToken();
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token);
        // Check expiration
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          return {
            isAuthenticated: true,
            walletAddress: payload.walletAddress,
            token,
            isAuthenticating: false,
          };
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
    return {
      isAuthenticated: false,
      isAuthenticating: false,
    };
  });

  /**
   * Hydrate auth state from cookie on client-side mount
   * This runs after SSR to restore session
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (authState.isAuthenticated) return; // Already initialized

    const token = getAuthToken();
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token);
        // Check expiration
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          setAuthState({
            isAuthenticated: true,
            walletAddress: payload.walletAddress,
            token,
            isAuthenticating: false,
          });
        }
      } catch (error) {
        console.error('Failed to decode token during hydration:', error);
      }
    }
  }, []); // Run once on mount

  /**
   * Authenticate with SIWE
   */
  const authenticate = useCallback(async () => {
    if (!address || !walletClient || !chainId) {
      toast.error('Please connect your wallet first');
      return;
    }

    setAuthState((prev) => ({
      ...prev,
      isAuthenticating: true,
      error: undefined,
    }));

    try {
      await signInWithEthereum(address, walletClient, chainId);

      // After successful auth, update state
      const token = getAuthToken();
      if (token) {
        const payload = jwtDecode<JwtPayload>(token);
        setAuthState({
          isAuthenticated: true,
          walletAddress: payload.walletAddress,
          token,
          isAuthenticating: false,
        });
        toast.success('Successfully authenticated!');
      }
    } catch (error) {
      const errorMessage = parseAuthError(error);
      setAuthState((prev) => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, [address, walletClient, chainId]);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      await fetch('/auth/signout', { method: 'POST' });
      setAuthState({
        isAuthenticated: false,
        isAuthenticating: false,
      });
      toast.success('Signed out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: undefined }));
  }, []);

  /**
   * Handle wallet changes
   * When wallet changes, clear auth state and optionally re-authenticate
   */
  useEffect(() => {
    if (!reAuthOnWalletChange) return;

    const currentAuthAddress = authState.walletAddress?.toLowerCase();
    const connectedAddress = address?.toLowerCase();

    // If authenticated but wallet changed, sign out and optionally re-auth
    if (authState.isAuthenticated && currentAuthAddress && connectedAddress) {
      if (currentAuthAddress !== connectedAddress) {
        console.log('Wallet changed, clearing authentication');
        toast.info('Wallet changed. Please authenticate again.');

        // Clear auth state
        setAuthState({
          isAuthenticated: false,
          isAuthenticating: false,
        });

        // Trigger auto-auth if enabled
        if (autoAuth && walletClient) {
          authenticate();
        }
      }
    }
  }, [
    address,
    authState.isAuthenticated,
    authState.walletAddress,
    reAuthOnWalletChange,
    autoAuth,
    walletClient,
    authenticate,
  ]);

  /**
   * Auto-authenticate when wallet connects
   */
  useEffect(() => {
    if (!autoAuth) return;
    if (!isConnected || !address || !walletClient) return;
    if (authState.isAuthenticated) return;
    if (authState.isAuthenticating) return;

    // Check if we have a valid token for this address
    const token = getAuthToken();
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token);
        if (
          payload.walletAddress.toLowerCase() === address.toLowerCase() &&
          payload.exp &&
          payload.exp * 1000 > Date.now()
        ) {
          // Valid token exists, update state
          setAuthState({
            isAuthenticated: true,
            walletAddress: payload.walletAddress,
            token,
            isAuthenticating: false,
          });
          return;
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }

    // No valid token, trigger auth
    authenticate();
  }, [
    autoAuth,
    isConnected,
    address,
    walletClient,
    authState.isAuthenticated,
    authState.isAuthenticating,
    authenticate,
  ]);

  /**
   * Monitor token expiration
   */
  useEffect(() => {
    if (!authState.token) return;

    try {
      const payload = jwtDecode<JwtPayload>(authState.token);
      if (payload.exp) {
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry <= 0) {
          // Token already expired
          signOut();
          return;
        }

        // Set timeout to sign out when token expires
        const timeout = setTimeout(() => {
          toast.error('Session expired. Please sign in again.');
          signOut();
        }, timeUntilExpiry);

        return () => clearTimeout(timeout);
      }
    } catch (error) {
      console.error('Failed to decode token for expiration check:', error);
    }
  }, [authState.token, signOut]);

  const value: AuthContextValue = {
    ...authState,
    authenticate,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * Access authentication state and methods.
 *
 * @example
 * ```tsx
 * const { isAuthenticated, walletAddress, authenticate, signOut } = useAuth();
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * useAuthUser Hook
 *
 * Get the authenticated user's wallet address.
 * Returns undefined if not authenticated.
 *
 * @example
 * ```tsx
 * const walletAddress = useAuthUser();
 * ```
 */
export function useAuthUser(): string | undefined {
  const { walletAddress } = useAuth();
  return walletAddress;
}

/**
 * useAuthToken Hook
 *
 * Get the JWT authentication token.
 * Returns undefined if not authenticated.
 *
 * @example
 * ```tsx
 * const token = useAuthToken();
 * ```
 */
export function useAuthToken(): string | undefined {
  const { token } = useAuth();
  return token;
}

/**
 * useRequireAuth Hook
 *
 * Ensures user is authenticated. Throws if not authenticated.
 * Use in components that require authentication.
 *
 * @example
 * ```tsx
 * const { walletAddress, token } = useRequireAuth();
 * ```
 */
export function useRequireAuth(): { walletAddress: string; token: string } {
  const { isAuthenticated, walletAddress, token } = useAuth();

  if (!isAuthenticated || !walletAddress || !token) {
    throw new Error('Authentication required');
  }

  return { walletAddress, token };
}

/**
 * useAuthStatus Hook
 *
 * Get authentication status flags.
 *
 * @example
 * ```tsx
 * const { isAuthenticated, isAuthenticating, error } = useAuthStatus();
 * ```
 */
export function useAuthStatus(): {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error?: string;
} {
  const { isAuthenticated, isAuthenticating, error } = useAuth();
  return { isAuthenticated, isAuthenticating, error };
}
