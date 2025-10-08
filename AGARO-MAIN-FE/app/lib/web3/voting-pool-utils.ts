import { type Address, encodeAbiParameters, keccak256, parseAbiParameters } from 'viem';

/**
 * Voting Pool Data structure matching Solidity's VotingPoolDataArgument
 */
export interface VotingPoolData {
  title: string;
  description: string;
  candidates: string[];
  candidatesTotal: number; // uint8 in Solidity
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
export function createVotingPoolData(
  data: Omit<VotingPoolData, 'candidatesTotal'>
): VotingPoolData {
  return {
    ...data,
    candidatesTotal: data.candidates.length,
  };
}

/**
 * Validates voting pool data before creating a pool
 *
 * @throws Error if validation fails
 */
export function validateVotingPoolData(data: Omit<VotingPoolData, 'candidatesTotal'>): void {
  // Validate title
  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Voting pool title cannot be empty');
  }

  // Validate description
  if (!data.description || data.description.trim().length === 0) {
    throw new Error('Voting pool description cannot be empty');
  }

  // Validate candidates
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Voting pool must have at least one candidate');
  }

  if (data.candidates.length > 255) {
    throw new Error('Voting pool cannot have more than 255 candidates (uint8 limit)');
  }

  // Validate each candidate is not empty
  data.candidates.forEach((candidate, index) => {
    if (!candidate || candidate.trim().length === 0) {
      throw new Error(`Candidate at index ${index} cannot be empty`);
    }
  });

  // Check for duplicate candidates
  const uniqueCandidates = new Set(data.candidates);
  if (uniqueCandidates.size !== data.candidates.length) {
    throw new Error('Voting pool cannot have duplicate candidates');
  }
}

/**
 * Validation result for hash verification
 */
export interface HashValidationResult {
  isValid: boolean;
  offChainHash: `0x${string}`;
  error?: string;
  details: {
    dataValid: boolean;
    hashComputed: boolean;
    encodingValid: boolean;
  };
}

/**
 * Validates and computes hash with comprehensive error checking
 *
 * @param poolData - Pool data to validate and hash
 * @param version - Pool version
 * @param owner - Owner address
 * @returns Validation result with hash
 */
export function validateAndComputeHash(
  poolData: Omit<VotingPoolData, 'candidatesTotal'>,
  version: bigint,
  owner: Address
): HashValidationResult {
  const result: HashValidationResult = {
    isValid: false,
    offChainHash: '0x0' as `0x${string}`,
    details: {
      dataValid: false,
      hashComputed: false,
      encodingValid: false,
    },
  };

  try {
    // Step 1: Validate pool data
    validateVotingPoolData(poolData);
    result.details.dataValid = true;

    // Step 2: Create full pool data
    const fullPoolData = createVotingPoolData(poolData);

    // Step 3: Test encoding
    try {
      const encoded = encodeVotingPoolData(fullPoolData, version, owner);
      result.details.encodingValid = encoded.length > 2; // More than just "0x"
    } catch (error) {
      result.error = `Encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return result;
    }

    // Step 4: Compute hash
    const hash = getVotingPoolHash(fullPoolData, version, owner);
    result.offChainHash = hash;
    result.details.hashComputed = true;

    // Step 5: Verify hash format
    if (!hash.startsWith('0x') || hash.length !== 66) {
      result.error = 'Invalid hash format (expected 32 bytes with 0x prefix)';
      return result;
    }

    result.isValid = true;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown validation error';
  }

  return result;
}
