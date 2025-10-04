/**
 * Example Voting Contract Configuration
 *
 * This is a template file showing how to configure your smart contract.
 * Replace with your actual contract ABI and addresses.
 */

/**
 * Contract ABI
 *
 * Get this from your compiled smart contract (Hardhat/Foundry/Remix output)
 *
 * IMPORTANT: Use 'as const' for TypeScript type inference
 */
export const EXAMPLE_VOTING_CONTRACT_ABI = [
  // View/Read functions
  {
    inputs: [],
    name: 'getTotalVotes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'uint256', name: 'voteCount', type: 'uint256' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'voter', type: 'address' }],
    name: 'hasVoted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
    ],
    name: 'createProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'proposalId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'VoteSubmitted',
    type: 'event',
  },
] as const;

/**
 * Contract Addresses by Chain ID
 *
 * Add your deployed contract addresses for each network
 */
export const EXAMPLE_VOTING_CONTRACT_ADDRESS = {
  1: '0x0000000000000000000000000000000000000000', // Ethereum Mainnet
  11155111: '0x0000000000000000000000000000000000000000', // Sepolia Testnet
  137: '0x0000000000000000000000000000000000000000', // Polygon Mainnet
  80002: '0x0000000000000000000000000000000000000000', // Polygon Amoy Testnet
} as const;

/**
 * Helper type for supported chain IDs
 */
export type SupportedChainId = keyof typeof EXAMPLE_VOTING_CONTRACT_ADDRESS;

/**
 * Get contract address for a specific chain
 *
 * @param chainId - The chain ID to get the address for
 * @returns The contract address or undefined if not deployed on that chain
 */
export function getVotingContractAddress(chainId: number): `0x${string}` | undefined {
  return EXAMPLE_VOTING_CONTRACT_ADDRESS[chainId as SupportedChainId];
}
