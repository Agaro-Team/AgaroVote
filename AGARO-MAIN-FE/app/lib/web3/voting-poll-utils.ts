import { type Address, encodeAbiParameters, keccak256, parseAbiParameters } from 'viem';

/**
 * Voting Pool Data structure matching Solidity's VotingPoolDataArgument
 */
export interface PollData {
  title: string;
  description: string;
  candidates: string[];
  candidatesTotal: number;
  version: bigint;
  owner: Address;
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
export function encodeVotingPollData(
  poolData: PollData,
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
    parseAbiParameters('string, string, string[], uint8, uint256, address'),
    [
      poolData.title,
      poolData.description,
      poolData.candidates,
      poolData.candidatesTotal,
      version,
      owner,
    ]
  );

  return encoded;
}

/**
 * Computes the keccak256 hash of voting poll data
 *
 * This replicates the Solidity function:
 * ```solidity
 * function getHash(
 *   VotingPollDataArgument calldata _pollData,
 *   uint256 version,
 *   address owner
 * ) internal pure returns (bytes32)
 * ```
 *
 * @param pollData - The voting poll data to hash
 * @param version - The pool version (uint256)
 * @param owner - The owner's address
 * @returns The keccak256 hash as bytes32
 *
 * @example
 * ```ts
 * const pollData = {
 *   title: "Best Programming Language",
 *   description: "Vote for your favorite language",
 *   candidates: ["TypeScript", "Rust", "Go"],
 *   candidatesTotal: 3
 * };
 *
 * const hash = getVotingPollHash(pollData, 1n, "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
 * // Returns: "0x..." (bytes32 hash)
 * ```
 */
export function getVotingPollHash(
  poolData: PollData,
  version: bigint,
  owner: Address
): `0x${string}` {
  const encoded = encodeVotingPollData(poolData, version, owner);
  return keccak256(encoded);
}
