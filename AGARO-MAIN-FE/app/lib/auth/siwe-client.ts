/**
 * Client-Side SIWE Authentication Service
 *
 * Handles the complete SIWE (Sign-In With Ethereum) flow on the client
 */
import { SiweMessage } from 'siwe';
import type { WalletClient } from 'viem';

/**
 * Sign in with Ethereum using SIWE
 *
 * @param address Wallet address
 * @param walletClient Wagmi wallet client for signing
 * @param chainId Current chain ID
 * @throws Error if authentication fails
 */
export async function signInWithEthereum(
  address: string,
  walletClient: WalletClient,
  chainId: number
): Promise<void> {
  try {
    // Step 1: Get nonce from backend (via resource route)
    const nonceResponse = await fetch(`/auth/siwe?walletAddress=${encodeURIComponent(address)}`);

    if (!nonceResponse.ok) {
      throw new Error('Failed to get nonce');
    }

    const {
      data: { nonce, expiresAt },
    } = await nonceResponse.json();

    // Step 2: Create SIWE message
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in to AgaroVote',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
      expirationTime: expiresAt,
    });

    const preparedMessage = message.prepareMessage();

    // Step 3: Sign message with wallet
    if (!walletClient.account) {
      throw new Error('Wallet account not available');
    }

    const signature = await walletClient.signMessage({
      account: walletClient.account,
      message: preparedMessage,
    });

    // Step 4: Submit to action for verification
    const formData = new FormData();
    formData.append('message', preparedMessage);
    formData.append('signature', signature);
    formData.append('walletAddress', address);

    const verifyResponse = await fetch('/auth/siwe', {
      method: 'POST',
      body: formData,
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({ error: 'Verification failed' }));
      throw new Error(errorData.error || 'Authentication failed');
    }

    // Cookie is set automatically by server
    // Redirect is handled by the action, but we'll force it just in case
    if (verifyResponse.redirected) {
      window.location.href = verifyResponse.url;
    } else {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('SIWE authentication error:', error);
    throw error;
  }
}

/**
 * Parse authentication error for user-friendly message
 *
 * @param error Error object
 * @returns User-friendly error message
 */
export function parseAuthError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('User rejected')) {
      return 'You rejected the signature request';
    }
    if (error.message.includes('nonce')) {
      return 'Invalid or expired nonce. Please try again';
    }
    if (error.message.includes('signature')) {
      return 'Signature verification failed';
    }
    return error.message;
  }
  return 'Authentication failed. Please try again';
}
