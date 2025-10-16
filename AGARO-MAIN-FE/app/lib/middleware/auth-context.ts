/**
 * Authentication Context for React Router Middleware
 *
 * Stores the authenticated user's state passed from middleware to loaders/actions.
 * Similar to existing walletContext pattern.
 */
import { createContext } from 'react-router';

export interface AuthState {
  isAuthenticated: boolean;
  walletAddress?: string;
  token?: string;
}

export const authContext = createContext<AuthState>();
