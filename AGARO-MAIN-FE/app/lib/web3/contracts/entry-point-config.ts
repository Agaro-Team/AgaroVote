/**
 * EntryPoint Contract Configuration
 *
 * Contract addresses for the EntryPoint voting contract across different chains.
 */
import type { Address } from 'viem';

/**
 * Contract Addresses by Chain ID
 */
export const ENTRY_POINT_CONTRACT_ADDRESS: Record<number, Address> = {
  1:
    (import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET as Address) ||
    '0x0000000000000000000000000000000000000000',
  11155111:
    (import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA as Address) ||
    '0x0000000000000000000000000000000000000000',
  31337:
    (import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT as Address) ||
    '0x0000000000000000000000000000000000000000',
};

/**
 * Get EntryPoint contract address for a specific chain
 *
 * @param chainId - The chain ID to get the address for
 * @returns The contract address or undefined if not deployed on that chain
 */
export function getEntryPointAddress(chainId: number): Address | undefined {
  return ENTRY_POINT_CONTRACT_ADDRESS[chainId];
}
