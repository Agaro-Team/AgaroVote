/**
 * Web3 Provider Component
 *
 * Wraps the application with Web3/Wagmi context providers.
 * This enables wallet connection and blockchain interactions throughout the app.
 */
import { WagmiProvider } from 'wagmi';

import { type ReactNode } from 'react';

import { config } from './config';

interface Web3ProviderProps {
  children: ReactNode;
}

/**
 * Web3Provider Component
 *
 * Usage:
 * ```tsx
 * <Web3Provider>
 *   <YourApp />
 * </Web3Provider>
 * ```
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
