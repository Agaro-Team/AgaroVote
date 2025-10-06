import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import {
  type HashValidationResult,
  type VotingPoolData,
  createVotingPoolData,
  getVotingPoolHash,
  validateAndComputeHash,
  validateVotingPoolData,
} from '~/lib/web3/voting-pool-utils';

import { useCallback, useMemo } from 'react';

/**
 * Hook to compute voting pool hash off-chain
 * This saves gas by computing the hash in the browser instead of calling the contract
 *
 * @example
 * ```tsx
 * function CreateVotingPool() {
 *   const { address } = useAccount();
 *   const { computePoolHash } = useVotingPoolHash();
 *
 *   const poolData = {
 *     title: "Best Language",
 *     description: "Vote for your favorite",
 *     candidates: ["TypeScript", "Rust", "Go"]
 *   };
 *
 *   // Compute hash off-chain (no gas cost!)
 *   const poolHash = computePoolHash(poolData, 1n);
 *
 *   // Then create the pool using the EntryPoint contract
 *   // The contract will compute the same hash and verify it matches
 * }
 * ```
 */
export function useVotingPoolHash() {
  const { address } = useAccount();

  /**
   * Compute voting pool hash off-chain
   *
   * @param poolData - Pool data without candidatesTotal (auto-calculated)
   * @param version - Pool version (defaults to 1n)
   * @param owner - Owner address (defaults to connected wallet)
   * @returns The keccak256 hash or undefined if no wallet connected
   */
  const computePoolHash = useMemo(
    () =>
      (
        poolData: Omit<VotingPoolData, 'candidatesTotal'>,
        version: bigint = 1n,
        owner?: Address
      ): `0x${string}` | undefined => {
        const ownerAddress = owner || address;
        if (!ownerAddress) {
          console.warn('No wallet address available for hash computation');
          return undefined;
        }

        const fullPoolData = createVotingPoolData(poolData);
        return getVotingPoolHash(fullPoolData, version, ownerAddress);
      },
    [address]
  );

  /**
   * Create full pool data with auto-calculated candidatesTotal
   */
  const createPoolData = useMemo(
    () =>
      (data: Omit<VotingPoolData, 'candidatesTotal'>): VotingPoolData => {
        return createVotingPoolData(data);
      },
    []
  );

  /**
   * Validate pool data before submission
   */
  const validatePoolData = useCallback((data: Omit<VotingPoolData, 'candidatesTotal'>): void => {
    validateVotingPoolData(data);
  }, []);

  /**
   * Validate and compute hash with comprehensive checks
   */
  const validateAndHash = useCallback(
    (
      poolData: Omit<VotingPoolData, 'candidatesTotal'>,
      version: bigint = 1n,
      owner?: Address
    ): HashValidationResult => {
      const ownerAddress = owner || address;
      if (!ownerAddress) {
        return {
          isValid: false,
          offChainHash: '0x0' as `0x${string}`,
          error: 'No wallet address available for hash computation',
          details: {
            dataValid: false,
            hashComputed: false,
            encodingValid: false,
          },
        };
      }

      return validateAndComputeHash(poolData, version, ownerAddress);
    },
    [address]
  );

  return {
    computePoolHash,
    createPoolData,
    validatePoolData,
    validateAndHash,
    address,
    isConnected: !!address,
  };
}

/**
 * Hook to verify if a computed hash matches the contract's hash
 * Useful for debugging and ensuring off-chain computation is correct
 */
export function useVerifyPoolHash() {
  const { computePoolHash } = useVotingPoolHash();

  const verifyHash = (
    expectedHash: `0x${string}`,
    poolData: Omit<VotingPoolData, 'candidatesTotal'>,
    version: bigint,
    owner?: Address
  ): boolean => {
    const computedHash = computePoolHash(poolData, version, owner);
    return computedHash === expectedHash;
  };

  return { verifyHash };
}
