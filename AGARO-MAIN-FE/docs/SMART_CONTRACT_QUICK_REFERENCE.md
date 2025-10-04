# Smart Contract Quick Reference

**Quick copy-paste guide for common smart contract patterns**

---

## 🚀 Setup (One Time)

### 1. Create Contract Config

```typescript
// app/lib/contracts/my-contract.ts
export const MY_CONTRACT_ABI = [
  // Your ABI here
] as const;

export const MY_CONTRACT_ADDRESS = {
  1: '0x...', // Mainnet
  11155111: '0x...', // Sepolia
  137: '0x...', // Polygon
  80002: '0x...', // Amoy
} as const;
```

---

## 📖 Reading Contract Data (View Functions)

### Basic Read

```typescript
import { useReadContract } from 'wagmi';
import { MY_CONTRACT_ABI, MY_CONTRACT_ADDRESS } from '~/lib/contracts/my-contract';
import { useWeb3Chain } from '~/hooks/use-web3';

function MyComponent() {
  const { chainId } = useWeb3Chain();
  
  const { data, isLoading } = useReadContract({
    address: MY_CONTRACT_ADDRESS[chainId],
    abi: MY_CONTRACT_ABI,
    functionName: 'myFunction',
  });

  return <div>{data?.toString()}</div>;
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

### Custom Hook Pattern

```typescript
// app/hooks/use-my-contract.ts
export function useMyData() {
  const { chainId } = useWeb3Chain();
  
  const { data, isLoading, refetch } = useReadContract({
    address: MY_CONTRACT_ADDRESS[chainId],
    abi: MY_CONTRACT_ABI,
    functionName: 'getData',
  });

  return {
    myData: data ? Number(data) : 0,
    isLoading,
    refetch,
  };
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

| Solidity Type | TypeScript Type | Example |
|---------------|----------------|---------|
| `uint256` | `bigint` | `BigInt(123)` |
| `address` | `` `0x${string}` `` | `'0x123...'` |
| `bool` | `boolean` | `true` |
| `string` | `string` | `'hello'` |
| `bytes` | `Hex` | `'0x1234'` |

### Converting Values

```typescript
// Number to BigInt (for contract input)
BigInt(123)

// BigInt to Number (for display)
Number(data)
data?.toString()

// Format ETH values
import { formatEther, parseEther } from 'viem';

formatEther(BigInt('1000000000000000000')) // '1.0'
parseEther('1.5') // BigInt
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
   query: { enabled: !!contractAddress && isConnected }
   ```

2. **Set refetch intervals for live data:**
   ```typescript
   query: { refetchInterval: 10000 } // 10 seconds
   ```

3. **Batch multiple reads with multicall:**
   ```typescript
   useReadContracts({ contracts: [...] })
   ```

4. **Cache expensive queries:**
   ```typescript
   query: { staleTime: 60000 } // Cache for 1 minute
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
args: [BigInt(value)] // ✅
args: [value]          // ❌
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

## 📦 Example Files

- `app/lib/contracts/example-voting-contract.ts`
- `app/hooks/use-example-voting-contract.ts`
- `app/components/example-voting-card.tsx`

