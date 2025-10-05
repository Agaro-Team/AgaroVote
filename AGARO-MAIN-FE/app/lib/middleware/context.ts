/**
 * Middleware Context Definitions
 *
 * Defines context types used by middleware to share data between
 * middleware functions and route handlers (loaders/actions).
 */
import { createContext } from 'react-router';

/**
 * Wallet Context
 *
 * Stores the wallet connection state passed from middleware to loaders/actions.
 * This allows us to verify wallet connection in middleware and access it in routes.
 */
export interface WalletState {
  isConnected: boolean;
  address?: string;
}

export const walletContext = createContext<WalletState>();
