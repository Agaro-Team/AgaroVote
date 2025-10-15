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

### 1. Auto-Generated Contract Hooks (Recommended)

**AgaroVote uses @wagmi/cli to auto-generate type-safe hooks from your Hardhat contracts.**

#### Configuration (`wagmi.config.ts`):

```typescript
import { defineConfig, loadEnv } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig(async () => {
  const env = loadEnv({
    mode: process.env.NODE_ENV,
    envDir: process.cwd(),
  });

  return {
    out: 'app/lib/web3/contracts/generated.ts',
    plugins: [
      react(),
      hardhat({
        project: '../AGARO-CONTRACT',
        include: ['EntryPoint*'],
        deployments: {
          AgaroVote: {
            1: env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET,
            11155111: env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA,
            31337: env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT,
          },
        },
      }),
    ],
  };
});
```

#### Generate Hooks:

```bash
# After compiling your Hardhat contracts
yarn wagmi

# Or watch mode for development
yarn wagmi:watch
```

#### Generated Output (`app/lib/web3/contracts/generated.ts`):

```typescript
// Auto-generated - DO NOT EDIT
export const useReadEntryPointVersion = () => { /* ... */ };
export const useWriteEntryPointNewVotingPool = () => { /* ... */ };
export const useWatchEntryPointVotingPoolCreatedEvent = () => { /* ... */ };
// ... more hooks
```

### 2. Contract Address Configuration

Store contract addresses per chain:

```typescript
// app/lib/web3/contracts/entry-point-config.ts
import type { Address } from 'viem';

export const ENTRY_POINT_CONTRACT_ADDRESS: Record<number, Address> = {
  1: import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET,
  11155111: import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA,
  31337: import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT,
};

export function getEntryPointAddress(chainId: number): Address | undefined {
  return ENTRY_POINT_CONTRACT_ADDRESS[chainId];
}
```

### 3. Environment Variables

```bash
# .env
VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET=0x...
VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA=0x...
VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT=0x...
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

### Using Auto-Generated Hooks

```typescript
import { useReadEntryPointVersion } from '~/lib/web3/contracts/generated';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import { useWeb3Chain } from '~/hooks/use-web3';

function ContractVersionDisplay() {
  const { chainId } = useWeb3Chain();

  const { data: version, isLoading, isError } = useReadEntryPointVersion({
    address: getEntryPointAddress(chainId),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading version</p>;

  return <p>Contract Version: {version?.toString()}</p>;
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

````typescript
// app/hooks/use-voting-contract.ts
/**
 * Custom Voting Contract Hooks
 *
 * Provides easy-to-use hooks for interacting with the voting contract.
 * Follows the same pattern as use-web3.ts hooks.
 */
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
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
export function useVotingContractRead<T = unknown>(functionName: string, args?: unknown[]) {
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
  const { data, isLoading, isError, refetch } = useVotingContractRead<bigint>('getTotalVotes');

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
  const { data, isLoading, isError, refetch } = useVotingContractRead<[string, bigint, boolean]>(
    'getProposal',
    [BigInt(proposalId)]
  );

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
````

---

## Complete Example: Creating a Voting Pool

Here's the actual implementation from AgaroVote:

```typescript
// app/routes/dashboard/voting-polls/create/hooks/use-create-poll.ts
import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useReadEntryPointVersion,
  useWatchEntryPointVotingPoolCreatedEvent,
  useWriteEntryPointNewVotingPool,
} from '~/lib/web3/contracts/generated';
import { createVotingPoolData, getVotingPoolHash } from '~/lib/web3/voting-pool-utils';
import { useWeb3Chain, useWeb3Wallet } from '../use-web3';

export interface VotingPoolData {
  title: string;
  description: string;
  candidates: string[];
  candidatesTotal: number;
}

export function useCreateVotingPool() {
  const { chainId } = useWeb3Chain();
  const { address: walletAddress } = useWeb3Wallet();
  const [offChainHash, setOffChainHash] = useState<`0x${string}` | null>(null);

  // Read contract version (for hash computation)
  const { data: version, refetch: refetchVersion } = useReadEntryPointVersion({
    address: getEntryPointAddress(chainId),
  });

  // Write to contract
  const { writeContract, data: txHash, isPending } = useWriteEntryPointNewVotingPool();

  // Wait for confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Watch for VotingPoolCreated event to verify hash
  useWatchEntryPointVotingPoolCreatedEvent({
    address: getEntryPointAddress(chainId),
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { poolHash: onChainHash } = log.args;

        if (!offChainHash || !onChainHash) return;

        // Verify hash matches
        if (offChainHash !== onChainHash) {
          toast.error('Hash Anomaly Detected!', {
            description: 'Off-chain and on-chain hashes do not match.',
          });
        } else {
          toast.success('Hash Verified!', {
            description: 'Off-chain and on-chain hashes match perfectly.',
          });
        }

        setOffChainHash(null);
      });
    },
  });

  const createPool = (poolData: VotingPoolData) => {
    if (!version || !walletAddress) {
      toast.error('Missing required data');
      return;
    }

    // Compute off-chain hash
    const fullPoolData = createVotingPoolData({
      title: poolData.title,
      description: poolData.description,
      candidates: poolData.candidates,
    });

    const computedHash = getVotingPoolHash(fullPoolData, version, walletAddress);
    setOffChainHash(computedHash);

    // Submit to blockchain
    writeContract({
      address: getEntryPointAddress(chainId)!,
      args: [
        {
          title: poolData.title,
          description: poolData.description,
          candidates: poolData.candidates,
          candidatesTotal: poolData.candidatesTotal,
        },
      ],
    });
  };

  // Refetch version after success (for next pool creation)
  useEffect(() => {
    if (isSuccess) {
      refetchVersion();
    }
  }, [isSuccess, refetchVersion]);

  return {
    createPool,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    offChainHash,
  };
}
```

### Usage in Component:

```typescript
// app/routes/dashboard/voting-polls/create/components/create-voting-poll-form.tsx
import { useCreatePoll } from '~/routes/dashboard/voting-polls/create/hooks/use-create-poll';
import { Button } from '~/components/ui/button';

export function CreateVotingPoolForm() {
  const { createPool, isPending, isConfirming } = useCreateVotingPool();

  const handleSubmit = (data: VotingPoolData) => {
    createPool(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isPending || isConfirming}>
        {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Create Pool'}
      </Button>
    </form>
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
args: [BigInt(value)];

// Display
data?.toString();
// or
Number(data);
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

| Action                | Hook                           | Gas Required | Returns          |
| --------------------- | ------------------------------ | ------------ | ---------------- |
| Read data             | `useReadContract`              | No           | Data instantly   |
| Write data            | `useWriteContract`             | Yes          | Transaction hash |
| Wait for confirmation | `useWaitForTransactionReceipt` | No           | Receipt          |
| Watch events          | `useWatchContractEvent`        | No           | Live updates     |
| Multiple reads        | `useReadContracts`             | No           | Array of data    |

---

## Hash Verification System

AgaroVote uses off-chain hash computation with on-chain verification for transparency and security.

### Voting Pool Utilities

```typescript
// app/lib/web3/voting-pool-utils.ts
import { encodeAbiParameters, keccak256, parseAbiParameters } from 'viem';

export interface VotingPoolData {
  title: string;
  description: string;
  candidates: string[];
  candidatesTotal: number;
}

// Encode pool data (matches Solidity encoding)
export function encodeVotingPoolData(
  poolData: VotingPoolData,
  version: bigint,
  owner: Address
): `0x${string}` {
  return encodeAbiParameters(
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
}

// Compute hash (matches Solidity hash)
export function getVotingPoolHash(
  poolData: VotingPoolData,
  version: bigint,
  owner: Address
): `0x${string}` {
  const encoded = encodeVotingPoolData(poolData, version, owner);
  return keccak256(encoded);
}

// Helper to create pool data with auto-calculated total
export function createVotingPoolData(
  data: Omit<VotingPoolData, 'candidatesTotal'>
): VotingPoolData {
  return {
    ...data,
    candidatesTotal: data.candidates.length,
  };
}
```

### Why Hash Verification?

1. **Transparency**: Users can verify data wasn't tampered with
2. **Security**: Detects anomalies between frontend and blockchain
3. **Gas Savings**: Hash computation is free off-chain
4. **Replay Prevention**: Version tracking prevents duplicate submissions

### Complete Flow

```
1. User submits pool data
   ↓
2. Frontend computes hash off-chain (free)
   ↓
3. Store hash for later comparison
   ↓
4. Submit transaction to blockchain
   ↓
5. Smart contract computes same hash on-chain
   ↓
6. Smart contract emits event with hash
   ↓
7. Frontend watches event
   ↓
8. Compare: off-chain hash === on-chain hash
   ↓
9. Success: Hashes match ✅
   Failure: Show security alert 🚨
```

---

## Next Steps

1. ✅ **Auto-generate hooks** - Use `yarn wagmi` after compiling contracts
2. ✅ **Configure addresses** - Set environment variables for each chain
3. ✅ **Build features** - Use generated hooks in your components
4. ✅ **Hash verification** - Implement off-chain computation for transparency
5. **Test thoroughly** - Test on testnet (Sepolia/Hardhat) before mainnet
6. **Deploy** - Deploy to mainnet when ready

---

## Related Documentation

- [Hardhat + Wagmi Integration](./HARDHAT_WAGMI_INTEGRATION.md) - Detailed guide on auto-generating hooks
- [Transaction Lifecycle](./TRANSACTION_LIFECYCLE.md) - Handling transaction states
- [Optimistic Mutations](./OPTIMISTIC_MUTATIONS.md) - Better UX with optimistic updates
- [Web3 Setup](./WEB3_SETUP.md) - Complete wallet integration guide

For more information on wagmi hooks, see:

- [wagmi documentation](https://wagmi.sh/react/api/hooks)
- [viem documentation](https://viem.sh/)
