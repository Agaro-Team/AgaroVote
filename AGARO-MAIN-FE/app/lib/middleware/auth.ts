/**
 * Authentication Middleware
 *
 * Middleware that checks if a user has connected their wallet before
 * allowing access to protected routes.
 *
 * Based on: https://reactrouter.com/how-to/middleware
 */
import { redirect } from 'react-router';
import { cookieToInitialState } from 'wagmi';
import { config } from '~/lib/web3/config';

import { walletContext } from './context';

/**
 * Wallet Authentication Middleware
 *
 * Checks if the user has a connected wallet by reading the wagmi state from cookies.
 * If no wallet is connected, redirects to the home page.
 * If connected, stores the wallet state in context for use in loaders/actions.
 *
 * @example
 * ```ts
 * // In your route file
 * import { walletAuthMiddleware } from '~/lib/middleware/auth';
 *
 * export const middleware: Route.MiddlewareFunction[] = [
 *   walletAuthMiddleware,
 * ];
 * ```
 */
export const walletAuthMiddleware = async (args: any) => {
  const { request, context } = args;
  // Get wagmi state from cookies
  const cookieHeader = request.headers.get('Cookie') || '';
  const initialState = cookieToInitialState(config, cookieHeader);

  // Check if wallet is connected
  const isConnected = !!initialState?.current;
  const address = initialState?.connections?.get(initialState.current!)?.accounts?.[0];

  if (!isConnected) {
    // Redirect to home page with a message parameter
    throw redirect('/?error=wallet-required');
  }

  // Store wallet state in context for use in loaders/actions
  context.set(walletContext, {
    isConnected,
    address,
  });

  // Continue to next middleware or route handler
  // (next() is called automatically when not explicitly called)
};

/**
 * Optional Wallet Middleware
 *
 * Similar to walletAuthMiddleware but doesn't redirect if wallet is not connected.
 * Instead, it just stores the wallet state in context.
 *
 * Useful for routes that show different content based on wallet connection
 * but don't strictly require it.
 *
 * @example
 * ```ts
 * export const middleware: Route.MiddlewareFunction[] = [
 *   optionalWalletMiddleware,
 * ];
 *
 * export async function loader({ context }: Route.LoaderArgs) {
 *   const wallet = context.get(walletContext);
 *   if (wallet?.isConnected) {
 *     // Show authenticated content
 *   } else {
 *     // Show public content
 *   }
 * }
 * ```
 */
export const optionalWalletMiddleware = async (args: any) => {
  const { request, context } = args;
  const cookieHeader = request.headers.get('Cookie') || '';
  const initialState = cookieToInitialState(config, cookieHeader);

  const isConnected = !!initialState?.current;
  const address = initialState?.connections?.get(initialState.current!)?.accounts?.[0];

  context.set(walletContext, {
    isConnected,
    address,
  });
};
