# Smart Contract Integration Guide

**How to connect and interact with your custom smart contracts using wagmi**

---

## 📋 Table of Contents

1. [Setup Contract Configuration](#setup-contract-configuration)
2. [Reading Contract Data (View Functions)](#reading-contract-data-view-functions)
3. [Writing to Contracts](#writing-to-contracts)
4. [Creating Custom Contract Hooks](#creating-custom-contract-hooks)
5. [Complete Example](#complete-example)
6. [Best Practices](#best-practices)

---

## Setup Contract Configuration

### 1. Create Contract Configuration File

Create a file to store your contract ABIs and addresses:

```typescript
// app/lib/contracts/voting-contract.ts

/**
 * Voting Contract Configuration
 * 
 * Store your contract ABI and addresses for different networks
 */

// Your contract ABI (get this from your compiled contract)
export const VOTING_CONTRACT_ABI = [
  {
    inputs: [],
    name: "getTotalVotes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    name: "getProposal",
    outputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "uint256", name: "voteCount", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Contract addresses for different chains
export const VOTING_CONTRACT_ADDRESS = {
  1: '0x...', // Ethereum Mainnet
  11155111: '0x...', // Sepolia Testnet
  137: '0x...', // Polygon Mainnet
  80002: '0x...', // Polygon Amoy Testnet
} as const;
``` 

### 2. Create Contract Constants Helper

```typescript
// app/lib/contracts/index.ts

export * from './voting-contract';

// Helper function to get contract address for current chain
export function getContractAddress(
  chainId: number,
  contractAddresses: Record<number, string>
): string | undefined {
  return contractAddresses[chainId];
}
```

---

## Reading Contract Data (View Functions)

### Basic Usage with `useReadContract`

```typescript
import { useReadContract } from 'wagmi';
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from '~/lib/contracts';
import { useWeb3Chain } from '~/hooks/use-web3';

function TotalVotesDisplay() {
  const { chainId } = useWeb3Chain();
  
  const { data, isLoading, isError, refetch } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS[chainId as keyof typeof VOTING_CONTRACT_ADDRESS],
    abi: VOTING_CONTRACT_ABI,
    functionName: 'getTotalVotes',
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading votes</p>;

  return <p>Total Votes: {data?.toString()}</p>;
}
```

### Reading with Arguments

```typescript
function ProposalDisplay({ proposalId }: { proposalId: number }) {
  const { chainId } = useWeb3Chain();
  
  const { data, isLoading, isError } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS[chainId as keyof typeof VOTING_CONTRACT_ADDRESS],
    abi: VOTING_CONTRACT_ABI,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
  });

  if (isLoading) return <div>Loading proposal...</div>;
  if (isError) return <div>Error loading proposal</div>;

  const [title, voteCount, isActive] = data || [];

  return (
    <div>
      <h3>{title}</h3>
      <p>Votes: {voteCount?.toString()}</p>
      <p>Status: {isActive ? 'Active' : 'Closed'}</p>
    </div>
  );
}
```

### Auto-refetch on Block Updates

```typescript
const { data } = useReadContract({
  address: contractAddress,
  abi: VOTING_CONTRACT_ABI,
  functionName: 'getTotalVotes',
  // Automatically refetch on new blocks
  query: {
    refetchInterval: 10000, // Refetch every 10 seconds
  },
});
```

---

## Writing to Contracts

### Basic Write Operation with `useWriteContract`

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from '~/lib/contracts';
import { useWeb3Chain } from '~/hooks/use-web3';

function VoteButton({ proposalId }: { proposalId: number }) {
  const { chainId } = useWeb3Chain();
  
  const { writeContract, data: hash, isPending, isError } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleVote = () => {
    writeContract({
      address: VOTING_CONTRACT_ADDRESS[chainId as keyof typeof VOTING_CONTRACT_ADDRESS],
      abi: VOTING_CONTRACT_ABI,
      functionName: 'vote',
      args: [BigInt(proposalId)],
    });
  };

  return (
    <div>
      <button 
        onClick={handleVote} 
        disabled={isPending || isConfirming}
      >
        {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Vote'}
      </button>
      {isSuccess && <p>Vote successful!</p>}
      {isError && <p>Error submitting vote</p>}
    </div>
  );
}
```

### Write with Event Handling

```typescript
import { parseEventLogs } from 'viem';

function VoteWithEvents({ proposalId }: { proposalId: number }) {
  const { chainId } = useWeb3Chain();
  const { writeContract, data: hash } = useWriteContract();
  
  const { data: receipt } = useWaitForTransactionReceipt({ hash });

  // Parse events from transaction receipt
  useEffect(() => {
    if (receipt) {
      const logs = parseEventLogs({
        abi: VOTING_CONTRACT_ABI,
        logs: receipt.logs,
      });
      console.log('Transaction events:', logs);
    }
  }, [receipt]);

  // ... rest of component
}
```

---

## Creating Custom Contract Hooks

Following your codebase pattern, create reusable hooks:

### Create Contract Hooks File

```typescript
// app/hooks/use-voting-contract.ts

/**
 * Custom Voting Contract Hooks
 * 
 * Provides easy-to-use hooks for interacting with the voting contract.
 * Follows the same pattern as use-web3.ts hooks.
 */
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESS } from '~/lib/contracts';
import { useWeb3Chain } from './use-web3';

/**
 * useVotingContractRead Hook
 * 
 * Generic hook for reading from the voting contract
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useVotingContractRead('getTotalVotes');
 * ```
 */
export function useVotingContractRead<T = unknown>(
  functionName: string,
  args?: unknown[]
) {
  const { chainId } = useWeb3Chain();
  const contractAddress = VOTING_CONTRACT_ADDRESS[chainId as keyof typeof VOTING_CONTRACT_ADDRESS];

  return useReadContract({
    address: contractAddress,
    abi: VOTING_CONTRACT_ABI,
    functionName,
    args,
  }) as { data: T; isLoading: boolean; isError: boolean; refetch: () => void };
}

/**
 * useTotalVotes Hook
 * 
 * Gets the total number of votes across all proposals
 * 
 * @example
 * ```tsx
 * const { totalVotes, isLoading } = useTotalVotes();
 * return <p>Total: {totalVotes}</p>;
 * ```
 */
export function useTotalVotes() {
  const { data, isLoading, isError, refetch } = useVotingContractRead<bigint>(
    'getTotalVotes'
  );

  return {
    totalVotes: data ? Number(data) : 0,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * useProposal Hook
 * 
 * Gets proposal details by ID
 * 
 * @example
 * ```tsx
 * const { proposal, isLoading } = useProposal(1);
 * return <div>{proposal?.title}</div>;
 * ```
 */
export function useProposal(proposalId: number) {
  const { data, isLoading, isError, refetch } = useVotingContractRead<
    [string, bigint, boolean]
  >('getProposal', [BigInt(proposalId)]);

  return {
    proposal: data
      ? {
          title: data[0],
          voteCount: Number(data[1]),
          isActive: data[2],
        }
      : null,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * useVote Hook
 * 
 * Submit a vote for a proposal
 * 
 * @example
 * ```tsx
 * const { vote, isPending, isSuccess } = useVote();
 * 
 * <button onClick={() => vote(1)}>Vote</button>
 * ```
 */
export function useVote() {
  const { chainId } = useWeb3Chain();
  const contractAddress = VOTING_CONTRACT_ADDRESS[chainId as keyof typeof VOTING_CONTRACT_ADDRESS];
  
  const { writeContract, data: hash, isPending, isError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const vote = (proposalId: number) => {
    if (!contractAddress) {
      console.error('Contract not deployed on this network');
      return;
    }
    
    writeContract({
      address: contractAddress,
      abi: VOTING_CONTRACT_ABI,
      functionName: 'vote',
      args: [BigInt(proposalId)],
    });
  };

  return {
    vote,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    txHash: hash,
  };
}

/**
 * useVotingContract Hook
 * 
 * Complete hook that provides all voting contract functionality
 * 
 * @example
 * ```tsx
 * const voting = useVotingContract();
 * const totalVotes = voting.useTotalVotes();
 * ```
 */
export function useVotingContract() {
  return {
    useTotalVotes,
    useProposal,
    useVote,
    // Add more contract functions here
  };
}
```

---

## Complete Example

Here's a complete voting component using the custom hooks:

```typescript
// app/components/voting-panel.tsx

/**
 * Voting Panel Component
 * 
 * Complete example of smart contract interaction
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { useTotalVotes, useProposal, useVote } from '~/hooks/use-voting-contract';
import { useWeb3Wallet } from '~/hooks/use-web3';

interface VotingPanelProps {
  proposalId: number;
}

export function VotingPanel({ proposalId }: VotingPanelProps) {
  const { isConnected } = useWeb3Wallet();
  const { totalVotes, isLoading: loadingTotal } = useTotalVotes();
  const { proposal, isLoading: loadingProposal, refetch } = useProposal(proposalId);
  const { vote, isPending, isConfirming, isSuccess, isError } = useVote();

  const handleVote = () => {
    vote(proposalId);
  };

  // Refetch proposal data after successful vote
  if (isSuccess) {
    refetch();
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>Please connect your wallet to vote</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loadingProposal) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!proposal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proposal Not Found</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{proposal.title}</CardTitle>
        <CardDescription>
          {proposal.isActive ? '🟢 Active' : '🔴 Closed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Votes</p>
          <p className="text-2xl font-bold">{proposal.voteCount}</p>
        </div>

        {loadingTotal ? (
          <Skeleton className="h-4 w-[150px]" />
        ) : (
          <p className="text-sm text-muted-foreground">
            Total votes across all proposals: {totalVotes}
          </p>
        )}

        <Button
          onClick={handleVote}
          disabled={!proposal.isActive || isPending || isConfirming}
          className="w-full"
        >
          {isPending && 'Preparing transaction...'}
          {isConfirming && 'Confirming transaction...'}
          {!isPending && !isConfirming && 'Submit Vote'}
        </Button>

        {isSuccess && (
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-100">
              ✅ Vote submitted successfully!
            </p>
          </div>
        )}

        {isError && (
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-100">
              ❌ Failed to submit vote. Please try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Usage in Route

```typescript
// app/routes/voting/index.tsx

import { VotingPanel } from '~/components/voting-panel';

export default function VotingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Active Proposals</h1>
      
      <div className="grid gap-4">
        <VotingPanel proposalId={1} />
        <VotingPanel proposalId={2} />
        <VotingPanel proposalId={3} />
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. **Type Safety**

Always use `as const` for your ABI to get proper TypeScript types:

```typescript
export const ABI = [...] as const;
```

### 2. **Error Handling**

Always handle errors gracefully:

```typescript
const { data, isError, error } = useReadContract({...});

if (isError) {
  console.error('Contract error:', error);
  return <ErrorDisplay message={error.message} />;
}
```

### 3. **Network Validation**

Check if contract is deployed on current network:

```typescript
const { chainId } = useWeb3Chain();
const contractAddress = CONTRACT_ADDRESS[chainId];

if (!contractAddress) {
  return <div>Contract not available on this network</div>;
}
```

### 4. **BigInt Handling**

Always use `BigInt` for large numbers and convert for display:

```typescript
// ✅ Correct
args: [BigInt(value)]

// Display
data?.toString()
// or
Number(data)
```

### 5. **Refetch After Writes**

Update UI after successful transactions:

```typescript
const { refetch } = useReadContract({...});
const { isSuccess } = useWaitForTransactionReceipt({ hash });

useEffect(() => {
  if (isSuccess) {
    refetch();
  }
}, [isSuccess, refetch]);
```

### 6. **Loading States**

Always show loading states for better UX:

```typescript
if (isPending) return <Spinner />;
if (isConfirming) return <div>Confirming transaction...</div>;
```

### 7. **Transaction Feedback**

Show transaction hash and block explorer link:

```typescript
{hash && (
  <a 
    href={`https://etherscan.io/tx/${hash}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    View transaction
  </a>
)}
```

### 8. **Multicall for Multiple Reads**

Use wagmi's multicall for batch reading:

```typescript
import { useReadContracts } from 'wagmi';

const { data } = useReadContracts({
  contracts: [
    {
      address: contractAddress,
      abi: ABI,
      functionName: 'getTotalVotes',
    },
    {
      address: contractAddress,
      abi: ABI,
      functionName: 'getProposal',
      args: [BigInt(1)],
    },
  ],
});
```

---

## Common Patterns

### Read-Only Functions (View/Pure)
- Use `useReadContract`
- No wallet connection required (but recommended)
- No gas fees
- Instant results

### State-Changing Functions
- Use `useWriteContract`
- Wallet connection required
- Costs gas
- Use `useWaitForTransactionReceipt` for confirmation

### Events
- Use `useWatchContractEvent` to listen for contract events
- Great for real-time updates

```typescript
import { useWatchContractEvent } from 'wagmi';

useWatchContractEvent({
  address: contractAddress,
  abi: ABI,
  eventName: 'VoteSubmitted',
  onLogs(logs) {
    console.log('New vote!', logs);
    refetch(); // Update UI
  },
});
```

---

## Quick Reference

| Action | Hook | Gas Required | Returns |
|--------|------|--------------|---------|
| Read data | `useReadContract` | No | Data instantly |
| Write data | `useWriteContract` | Yes | Transaction hash |
| Wait for confirmation | `useWaitForTransactionReceipt` | No | Receipt |
| Watch events | `useWatchContractEvent` | No | Live updates |
| Multiple reads | `useReadContracts` | No | Array of data |

---

## Next Steps

1. Add your contract ABI to `app/lib/contracts/`
2. Create custom hooks in `app/hooks/use-[contract-name].ts`
3. Build UI components using your hooks
4. Test on testnet first (Sepolia/Amoy)
5. Deploy to mainnet

---

For more information on wagmi hooks, see:
- [wagmi documentation](https://wagmi.sh/react/api/hooks)
- [viem documentation](https://viem.sh/)

