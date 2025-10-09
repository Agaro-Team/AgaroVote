import { concat, keccak256 } from 'viem';

/**
 * Generate Merkle root hash from allowed addresses
 * This is done off-chain to minimize gas fees
 * Browser-compatible implementation using only viem
 */
export const generateMerkleRoot = (addresses: string[]): `0x${string}` => {
  // Hash each address using viem's keccak256
  let hashes = addresses.map((addr) => keccak256(addr as `0x${string}`));

  // Handle edge cases
  if (hashes.length === 0) {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  if (hashes.length === 1) {
    return hashes[0];
  }

  // Build the Merkle tree bottom-up
  while (hashes.length > 1) {
    const nextLevel: `0x${string}`[] = [];

    // Process pairs
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        // Pair exists - sort and hash together (sorted pairs)
        const [left, right] =
          hashes[i] < hashes[i + 1] ? [hashes[i], hashes[i + 1]] : [hashes[i + 1], hashes[i]];

        const combined = concat([left, right]);
        nextLevel.push(keccak256(combined));
      } else {
        // Odd one out - promote to next level
        nextLevel.push(hashes[i]);
      }
    }

    hashes = nextLevel;
  }

  return hashes[0];
};
