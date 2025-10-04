# Multi-Chain Configuration and Optimization

## Overview

This document explains how wagmi handles multiple blockchain networks and how to optimize queries to prevent unnecessary network requests when working with multi-chain configurations.

## The Problem

When you configure multiple chains in wagmi with separate transports:

```ts
export const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  transports: {
    [mainnet.id]: http(), // Chain ID: 1
    [sepolia.id]: http(), // Chain ID: 11155111
    [hardhat.id]: http(), // Chain ID: 31337
  },
});
```

**Default Behavior**: Wagmi will attempt to query **all configured chains** for certain operations, including:

1. **Initial Chain Detection** - Checking connectivity for all chains
2. **Contract Read Operations** - If chainId is not specified, it may query multiple chains
3. **Event Watching** - Listening for events on all chains
4. **Transport Health Checks** - Verifying each transport is responsive

### Why This Happens

This is **expected wagmi behavior** because:

- Wagmi supports multi-chain dApps where contracts exist on multiple chains
- Without explicit chainId configuration, wagmi doesn't know which chain your contract is on
- It attempts to be helpful by checking all available chains

### Performance Impact

- 🔴 Multiple RPC requests on page load
- 🔴 Unnecessary network traffic
- 🔴 Slower initial load times
- 🔴 Potential rate limiting from RPC providers
- 🔴 Confusing network logs showing requests to chains you're not using

## The Solution

### 1. Specify `chainId` in Read Hooks

**Before** (queries all chains):

```ts
const { data: counterValue } = useReadCounterX();
```

**After** (queries only the connected chain):

```ts
import { useChainId } from 'wagmi';

const chainId = useChainId();
const { data: counterValue } = useReadCounterX({
  chainId, // Only query the active chain
});
```

### 2. Specify `chainId` in Event Watchers

**Before** (watches all chains):

```ts
useWatchCounterIncrementEvent({
  onLogs: (logs) => {
    // Handle events
  },
});
```

**After** (watches only the connected chain):

```ts
import { useChainId } from 'wagmi';

const chainId = useChainId();
useWatchCounterIncrementEvent({
  chainId, // Only watch the active chain
  onLogs: (logs) => {
    // Handle events
  },
});
```

### 3. Write Operations (Already Optimized)

Write operations automatically use the connected chain from the user's wallet, so no additional configuration is needed:

```ts
// ✅ Already optimized - uses the connected wallet's chain
const { writeContractAsync: increment } = useWriteCounterInc();

await increment({
  args: [],
});
```

## Implementation Example

Here's a complete example from our Counter UI hook:

```ts
import { useChainId } from 'wagmi';
import {
  useReadCounterX,
  useWatchCounterIncrementEvent,
  useWriteCounterInc,
} from '~/lib/web3/contracts/generated';

import { useState } from 'react';

export const useCounterUI = () => {
  const [events, setEvents] = useState<string[]>([]);
  const chainId = useChainId(); // Get the active chain

  // ✅ Read only from the active chain
  const {
    data: counterValue,
    isLoading,
    queryKey,
  } = useReadCounterX({
    chainId,
  });

  // ✅ Write to the active chain (automatic)
  const { writeContractAsync: increment, isPending } = useWriteCounterInc();

  // ✅ Watch events only on the active chain
  useWatchCounterIncrementEvent({
    chainId,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const newEvent = `Counter incremented by ${log.args.by}`;
        setEvents((prev) => [newEvent, ...prev.slice(0, 4)]);
      });
    },
  });

  // ... rest of hook
};
```

## Advanced: Multi-Chain Contract Deployments

If your contract is deployed on **multiple chains** and you want to support all of them:

### Option 1: Query Specific Chains

```ts
// Query mainnet
const { data: mainnetCounter } = useReadCounterX({
  chainId: mainnet.id,
});

// Query sepolia
const { data: sepoliaCounter } = useReadCounterX({
  chainId: sepolia.id,
});
```

### Option 2: Use Contract Address Mapping

If you have different contract addresses per chain:

```ts
// lib/web3/contracts/counter-config.ts
export const counterAddresses = {
  [mainnet.id]: '0x1234...', // Mainnet address
  [sepolia.id]: '0x5678...', // Sepolia address
  [hardhat.id]: '0xCC7A...', // Local address
} as const;

// Hook
const chainId = useChainId();
const contractAddress = counterAddresses[chainId];

const { data: counterValue } = useReadContract({
  address: contractAddress,
  abi: counterAbi,
  functionName: 'x',
  chainId,
});
```

### Option 3: Conditional Queries Based on Deployment

```ts
const chainId = useChainId();

// Only query if contract is deployed on this chain
const { data: counterValue } = useReadCounterX({
  chainId,
  query: {
    enabled: isContractDeployed(chainId), // Your custom check
  },
});
```

## Debugging Multi-Chain Issues

### 1. Check Network Logs

Open your browser's Network tab and filter by:

- **Mainnet**: Look for requests to `ethereum.publicnode.com` or your mainnet RPC
- **Sepolia**: Look for requests to `sepolia.publicnode.com` or your sepolia RPC
- **Hardhat**: Look for requests to `localhost:8545` or `127.0.0.1:8545`

### 2. Add Logging

Temporarily add logging to see which chains are being queried:

```ts
const chainId = useChainId();

useEffect(() => {
  console.log('Current chain ID:', chainId);
}, [chainId]);

const { data: counterValue } = useReadCounterX({
  chainId,
  query: {
    onSuccess: () => console.log('Query success on chain:', chainId),
    onError: (error) => console.error('Query failed on chain:', chainId, error),
  },
});
```

### 3. Check wagmi DevTools

If you're using wagmi devtools, you can see all active queries and their chainId:

```tsx
import { WagmiProvider } from 'wagmi';

import { WagmiDevTools } from '@wagmi/devtools';

<WagmiProvider config={config}>
  <YourApp />
  <WagmiDevTools /> {/* Shows all queries and their chains */}
</WagmiProvider>;
```

## Best Practices

### ✅ DO

1. **Always specify `chainId`** for read operations
2. **Use `useChainId()`** to get the active chain
3. **Enable queries conditionally** based on contract deployment
4. **Document which chains** your contracts are deployed on
5. **Test on all configured chains** to ensure compatibility

### ❌ DON'T

1. **Don't omit `chainId`** unless you explicitly want multi-chain queries
2. **Don't hardcode chainIds** - use `useChainId()` for active chain
3. **Don't configure unused chains** - only add chains you actually support
4. **Don't forget to update event watchers** with chainId
5. **Don't assume default chain** - wagmi doesn't have a default chain concept

## Configuration Checklist

When setting up multi-chain support:

- [ ] Configure only the chains you actually need
- [ ] Add chainId to all `useRead*` hooks
- [ ] Add chainId to all `useWatch*Event` hooks
- [ ] Document contract addresses per chain
- [ ] Test switching between chains
- [ ] Verify no unnecessary RPC calls in network logs
- [ ] Add error handling for unsupported chains
- [ ] Update UI to show current chain

## Related Hooks

### `useChainId()`

Returns the currently connected chain ID from the user's wallet.

```ts
import { useChainId } from 'wagmi';

const chainId = useChainId();
// Returns: 1 (mainnet), 11155111 (sepolia), 31337 (hardhat), etc.
```

### `useChain()`

Returns full chain information:

```ts
import { useAccount } from 'wagmi';

const { chain } = useAccount();
// Returns: { id: 1, name: 'Ethereum', ... }
```

### `useSwitchChain()`

Allows programmatic chain switching:

```ts
import { useSwitchChain } from 'wagmi';

const { switchChain } = useSwitchChain();

// Switch to Sepolia
switchChain({ chainId: 11155111 });
```

## Summary

**The Issue**: Multiple chain configurations cause wagmi to query all chains by default

**The Solution**: Always specify `chainId` in read and watch hooks

**The Result**:

- ⚡ Faster load times
- 🎯 Targeted queries to only the active chain
- 📉 Reduced RPC requests
- ✅ Better user experience

## Further Reading

- [wagmi Multi-Chain Documentation](https://wagmi.sh/react/guides/multi-chain)
- [wagmi useReadContract](https://wagmi.sh/react/api/hooks/useReadContract)
- [wagmi useChainId](https://wagmi.sh/react/api/hooks/useChainId)
- [Viem Multi-Chain](https://viem.sh/docs/clients/public.html#multi-chain)
