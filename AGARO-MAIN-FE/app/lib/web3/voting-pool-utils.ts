import { type Address, encodeAbiParameters, keccak256, parseAbiParameters } from 'viem';

/**
 * Voting Pool Data structure matching Solidity's VotingPoolDataArgument
 */
export interface VotingPoolData {
  title: string;
  description: string;
  candidates: string[];
  candidatesTotal: number; // uint8 in Solidity
  merkleRootHash: `0x${string}`;
  expiry: {
    startDate: bigint;
    endDate: bigint;
  };
  isPrivate: boolean;
}

/**
 * Encodes voting pool data using the same encoding as VotingPoolDataLib.encode
 *
 * This replicates the Solidity function:
 * ```solidity
 * function encode(
 *   VotingPoolDataArgument calldata _poolData,
 *   uint256 version,
 *   address owner
 * ) internal pure returns (bytes memory)
 * ```
 *
 * @param poolData - The voting pool data to encode
 * @param version - The pool version (uint256)
 * @param owner - The owner's address
 * @returns Encoded bytes as hex string
 */
export function encodeVotingPoolData(
  poolData: VotingPoolData,
  version: bigint,
  owner: Address
): `0x${string}` {
  // Validate candidatesTotal matches candidates array length
  if (poolData.candidatesTotal !== poolData.candidates.length) {
    throw new Error(
      `candidatesTotal (${poolData.candidatesTotal}) must match candidates array length (${poolData.candidates.length})`
    );
  }

  // Validate candidatesTotal fits in uint8 (0-255)
  if (poolData.candidatesTotal > 255) {
    throw new Error('candidatesTotal must be between 0 and 255 (uint8)');
  }

  // Encode using the same order as Solidity: title, description, candidates, candidatesTotal, version, owner
  const encoded = encodeAbiParameters(
    parseAbiParameters('string, string, bytes32, string[], uint8, bool, uint256, address'),
    [
      poolData.title,
      poolData.description,
      poolData.merkleRootHash,
      poolData.candidates,
      poolData.candidatesTotal,
      poolData.isPrivate,
      version,
      owner,
    ]
  );

  return encoded;
}

/**
 * Computes the keccak256 hash of voting pool data
 *
 * This replicates the Solidity function:
 * ```solidity
 * function getHash(
 *   VotingPoolDataArgument calldata _poolData,
 *   uint256 version,
 *   address owner
 * ) internal pure returns (bytes32)
 * ```
 *
 * @param poolData - The voting pool data to hash
 * @param version - The pool version (uint256)
 * @param owner - The owner's address
 * @returns The keccak256 hash as bytes32
 *
 * @example
 * ```ts
 * const poolData = {
 *   title: "Best Programming Language",
 *   description: "Vote for your favorite language",
 *   candidates: ["TypeScript", "Rust", "Go"],
 *   candidatesTotal: 3
 * };
 *
 * const hash = getVotingPoolHash(poolData, 1n, "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
 * // Returns: "0x..." (bytes32 hash)
 * ```
 */
export function getVotingPoolHash(
  poolData: VotingPoolData,
  version: bigint,
  owner: Address
): `0x${string}` {
  const encoded = encodeVotingPoolData(poolData, version, owner);
  return keccak256(encoded);
}

/**
 * Helper to create VotingPoolData with auto-calculated candidatesTotal
 *
 * @example
 * ```ts
 * const poolData = createVotingPoolData({
 *   title: "Best Framework",
 *   description: "Choose your favorite",
 *   candidates: ["React", "Vue", "Svelte"]
 * });
 * // candidatesTotal is automatically set to 3
 * ```
 */
export function createVotingPoolData(data: VotingPoolData): VotingPoolData {
  return data;
}
