# Smart Contract Quick Reference

**Quick copy-paste guide for common smart contract patterns**

---

## 🚀 Setup (One Time)

### 1. Auto-Generate Contract Hooks (Recommended)

```bash
# After compiling Hardhat contracts
yarn wagmi

# Watch mode for development
yarn wagmi:watch
```

### 2. Contract Address Config

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

---

## 📖 Reading Contract Data (View Functions)

### Using Auto-Generated Hooks

```typescript
import { useReadEntryPointVersion } from '~/lib/web3/contracts/generated';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import { useWeb3Chain } from '~/hooks/use-web3';

function MyComponent() {
  const { chainId } = useWeb3Chain();

  const { data: version, isLoading } = useReadEntryPointVersion({
    address: getEntryPointAddress(chainId),
  });

  return <div>Version: {version?.toString()}</div>;
}
```

### Read with Arguments

```typescript
const { data } = useReadContract({
  address: contractAddress,
  abi: ABI,
  functionName: 'getUser',
  args: [userAddress, BigInt(123)], // Use BigInt for uint256
});
```

### Custom Hook Pattern with Optimistic Updates

```typescript
// app/hooks/voting-pools/use-create-voting-pool.ts
import { useWriteEntryPointNewVotingPool } from '~/lib/web3/contracts/generated';
import { useOptimisticMutation } from '../use-optimistic-mutation';

export function useCreateVotingPool() {
  const { chainId } = useWeb3Chain();
  
  const mutation = useOptimisticMutation({
    queryKey: ['voting-pools'],
    successMessage: 'Voting pool created!',
  });

  const { writeContract, isPending } = useWriteEntryPointNewVotingPool({
    mutation: mutation.callbacks,
  });

  const createPool = (data: VotingPoolData) => {
    writeContract({
      address: getEntryPointAddress(chainId)!,
      args: [data],
    });
  };

  return { createPool, isPending };
}
```

---

## ✍️ Writing to Contract (Transactions)

### Basic Write

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

function MyComponent() {
  const { chainId } = useWeb3Chain();

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = () => {
    writeContract({
      address: MY_CONTRACT_ADDRESS[chainId],
      abi: MY_CONTRACT_ABI,
      functionName: 'myFunction',
      args: [BigInt(123)],
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending || isConfirming}>
      {isPending ? 'Preparing...' : isConfirming ? 'Confirming...' : 'Submit'}
    </button>
  );
}
```

### Custom Hook Pattern

```typescript
// app/hooks/use-my-contract.ts
export function useMyAction() {
  const { chainId } = useWeb3Chain();

  const { writeContract, data: hash, isPending, isError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const executeAction = (value: number) => {
    writeContract({
      address: MY_CONTRACT_ADDRESS[chainId],
      abi: MY_CONTRACT_ABI,
      functionName: 'execute',
      args: [BigInt(value)],
    });
  };

  return {
    executeAction,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    txHash: hash,
  };
}
```

---

## 🔄 Common Patterns

### 1. Read Multiple Values (Multicall)

```typescript
import { useReadContracts } from 'wagmi';

const { data } = useReadContracts({
  contracts: [
    {
      address: contractAddress,
      abi: ABI,
      functionName: 'function1',
    },
    {
      address: contractAddress,
      abi: ABI,
      functionName: 'function2',
      args: [BigInt(1)],
    },
  ],
});

// data[0].result - first result
// data[1].result - second result
```

### 2. Write with Auto-Refetch

```typescript
const { data: contractData, refetch } = useReadContract({...});
const { isSuccess } = useWaitForTransactionReceipt({ hash });

useEffect(() => {
  if (isSuccess) {
    refetch(); // Update UI after transaction
  }
}, [isSuccess, refetch]);
```

### 3. Watch Contract Events

```typescript
import { useWatchContractEvent } from 'wagmi';

useWatchContractEvent({
  address: contractAddress,
  abi: ABI,
  eventName: 'MyEvent',
  onLogs(logs) {
    console.log('Event detected:', logs);
    refetch(); // Update UI on events
  },
});
```

### 4. Conditional Query

```typescript
const { data } = useReadContract({
  address: contractAddress,
  abi: ABI,
  functionName: 'getData',
  query: {
    enabled: isConnected && !!contractAddress, // Only run if conditions met
  },
});
```

### 5. Transaction Status UI

```typescript
{isPending && <div>⏳ Preparing transaction...</div>}
{isConfirming && <div>⏳ Waiting for confirmation...</div>}
{isSuccess && <div>✅ Transaction successful!</div>}
{isError && <div>❌ Transaction failed</div>}

{txHash && (
  <a href={`https://etherscan.io/tx/${txHash}`} target="_blank">
    View on Explorer
  </a>
)}
```

---

## 📦 Common Data Types

| Solidity Type | TypeScript Type     | Example       |
| ------------- | ------------------- | ------------- |
| `uint256`     | `bigint`            | `BigInt(123)` |
| `address`     | `` `0x${string}` `` | `'0x123...'`  |
| `bool`        | `boolean`           | `true`        |
| `string`      | `string`            | `'hello'`     |
| `bytes`       | `Hex`               | `'0x1234'`    |

### Converting Values

```typescript
// Format ETH values
import { formatEther, parseEther } from 'viem';

// Number to BigInt (for contract input)
BigInt(123);

// BigInt to Number (for display)
Number(data);
data?.toString();

formatEther(BigInt('1000000000000000000')); // '1.0'
parseEther('1.5'); // BigInt
```

---

## 🎯 Complete Component Example

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

function MyContractComponent() {
  const { isConnected } = useWeb3Wallet();
  const { chainId } = useWeb3Chain();

  // Read
  const { data, isLoading, refetch } = useReadContract({
    address: MY_CONTRACT_ADDRESS[chainId],
    abi: MY_CONTRACT_ABI,
    functionName: 'getValue',
  });

  // Write
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleAction = () => {
    writeContract({
      address: MY_CONTRACT_ADDRESS[chainId],
      abi: MY_CONTRACT_ABI,
      functionName: 'setValue',
      args: [BigInt(999)],
    });
  };

  // Refetch after success
  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  if (!isConnected) return <div>Connect wallet</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Value: {data?.toString()}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleAction}
          disabled={isPending || isConfirming}
        >
          {isPending ? 'Preparing...' : isConfirming ? 'Confirming...' : 'Update Value'}
        </Button>
        {isSuccess && <p>✅ Success!</p>}
      </CardContent>
    </Card>
  );
}
```

---

## 🛠️ Useful Utilities

### Get Contract Address by Chain

```typescript
function getContractAddress(chainId: number) {
  return CONTRACT_ADDRESS[chainId as keyof typeof CONTRACT_ADDRESS];
}
```

### Block Explorer URLs

```typescript
const EXPLORER_URLS: Record<number, string> = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
  137: 'https://polygonscan.com',
  80002: 'https://amoy.polygonscan.com',
};

function getExplorerTxUrl(chainId: number, txHash: string) {
  return `${EXPLORER_URLS[chainId]}/tx/${txHash}`;
}
```

### Error Messages

```typescript
{isError && error && (
  <div className="text-red-500">
    {error.message.includes('User rejected')
      ? 'Transaction cancelled'
      : 'Transaction failed'}
  </div>
)}
```

---

## 📚 File Structure

Recommended organization:

```
app/
├── lib/
│   └── contracts/
│       ├── my-contract.ts         # ABI + addresses
│       └── another-contract.ts
├── hooks/
│   ├── use-my-contract.ts         # Custom contract hooks
│   └── use-web3.ts                # Wallet hooks
└── components/
    ├── my-contract-card.tsx       # UI components
    └── ui/
```

---

## ⚡ Performance Tips

1. **Use `enabled` to control queries:**

   ```typescript
   query: {
     enabled: !!contractAddress && isConnected;
   }
   ```

2. **Set refetch intervals for live data:**

   ```typescript
   query: {
     refetchInterval: 10000;
   } // 10 seconds
   ```

3. **Batch multiple reads with multicall:**

   ```typescript
   useReadContracts({ contracts: [...] })
   ```

4. **Cache expensive queries:**
   ```typescript
   query: {
     staleTime: 60000;
   } // Cache for 1 minute
   ```

---

## 🐛 Common Issues

### Issue: "Contract not deployed"

**Fix:** Check if contract address exists for current chain:

```typescript
if (!CONTRACT_ADDRESS[chainId]) {
  return <div>Contract not available on this network</div>;
}
```

### Issue: "Invalid BigInt"

**Fix:** Always convert numbers to BigInt:

```typescript
args: [BigInt(value)]; // ✅
args: [value]; // ❌
```

### Issue: "User rejected transaction"

**Fix:** Handle user cancellation:

```typescript
if (error?.message.includes('User rejected')) {
  // Show friendly message
}
```

---

## 📖 Full Documentation

- [Complete Guide](./SMART_CONTRACT_INTEGRATION.md)
- [Web3 Setup](./WEB3_SETUP.md)
- [Web3 Quick Start](./WEB3_QUICK_START.md)

## 🗳️ AgaroVote Voting Pool Patterns

### Create Voting Pool with Hash Verification

```typescript
import { useCreatePoll } from '~/routes/dashboard/voting-polls/create/hooks/use-create-poll';

function CreatePollButton() {
  const { createPool, isPending, isConfirming, offChainHash } = useCreateVotingPool();

  const handleCreate = () => {
    createPool({
      title: 'Best Programming Language',
      description: 'Vote for your favorite',
      candidates: ['TypeScript', 'Rust', 'Go'],
      candidatesTotal: 3,
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={isPending || isConfirming}>
        {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Create Pool'}
      </button>
      {offChainHash && <p>Off-chain hash: {offChainHash}</p>}
    </div>
  );
}
```

### Compute Hash Off-Chain

```typescript
import { useVotingPollHash } from '~/lib/web3/voting-poll-utils';

function HashPreview() {
  const { computePoolHash, validateAndHash } = useVotingPoolHash();

  const poolData = {
    title: 'Test Pool',
    description: 'Description',
    candidates: ['A', 'B', 'C'],
  };

  // Simple hash computation
  const hash = computePoolHash(poolData, 1n); // version 1

  // With validation
  const result = validateAndHash(poolData, 1n);
  if (result.isValid) {
    console.log('Hash:', result.offChainHash);
  } else {
    console.error('Validation error:', result.error);
  }

  return <div>Hash: {hash}</div>;
}
```

### Watch Voting Pool Events

```typescript
import { useWatchEntryPointVotingPoolCreatedEvent } from '~/lib/web3/contracts/generated';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';

function VotingPoolListener() {
  const { chainId } = useWeb3Chain();

  useWatchEntryPointVotingPoolCreatedEvent({
    address: getEntryPointAddress(chainId),
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { poolHash, owner, version } = log.args;
        console.log('New pool created:', { poolHash, owner, version });
        // Refetch pools or update UI
      });
    },
  });

  return null; // Event listener component
}
```

### Transaction Lifecycle with Hash Verification

```typescript
import { useWaitForTransactionReceiptEffect } from '~/hooks/use-web3';

function PoolCreationFlow() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [offChainHash, setOffChainHash] = useState<`0x${string}` | undefined>();

  // Wait for transaction confirmation
  useWaitForTransactionReceiptEffect(txHash, (receipt) => {
    console.log('Transaction confirmed:', receipt.blockNumber);
    // Refetch data after confirmation
    queryClient.invalidateQueries({ queryKey: ['voting-polls'] });
  });

  const handleCreate = async () => {
    // 1. Compute hash
    const hash = computePoolHash(poolData, version);
    setOffChainHash(hash);

    // 2. Submit transaction
    const tx = await writeContract({ args: [poolData] });
    setTxHash(tx);
  };

  return (
    <div>
      {txHash && <p>Transaction: {txHash}</p>}
      {offChainHash && <p>Expected hash: {offChainHash}</p>}
    </div>
  );
}
```

---

## 📦 Example Files (AgaroVote)

- `app/lib/web3/contracts/entry-point-config.ts` - Contract addresses
- `app/lib/web3/contracts/generated.ts` - Auto-generated hooks
- `app/lib/web3/voting-poll-utils.ts` - Hash utilities
- `app/routes/dashboard/voting-polls/create/hooks/use-create-poll.ts` - Poll creation
- `app/routes/dashboard/voting-polls/create/components/create-voting-poll-form.tsx` - UI component
