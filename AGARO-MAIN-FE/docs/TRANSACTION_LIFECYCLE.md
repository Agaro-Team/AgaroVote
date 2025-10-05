# Transaction Lifecycle Handling

## Overview

This guide explains how to properly handle blockchain transaction lifecycles in the AgaroVote application, ensuring users understand what's happening at each stage and preventing confusion when the UI doesn't immediately reflect on-chain changes.

## The Problem

When interacting with smart contracts, there's a multi-step process that can confuse users:

```
1. User clicks "Increment"
2. Transaction is sent → Gets tx hash (immediate)
3. Transaction is pending → Waiting to be mined (a few seconds)
4. Transaction is confirmed → Included in a block (success!)
5. UI queries contract → Fetches new value (refetch needed)
```

**The Issue**: Between steps 4 and 5, users see "success" but the counter still shows the old value, causing confusion.

## The Solution

We implement a complete transaction lifecycle flow with three distinct states:

1. **Sending** - Transaction is being sent to the blockchain
2. **Confirming** - Transaction hash received, waiting for block confirmation
3. **Confirmed** - Transaction mined, refetch data and show updated value

## Implementation

### 1. Track Transaction Hash

Store the transaction hash to monitor its confirmation status:

```ts
// app/hooks/use-counter-ui.ts
const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

const handleIncrement = async () => {
  try {
    const hash = await increment({ args: [] });
    setTxHash(hash); // Store hash to track confirmation
  } catch (error) {
    console.error('Failed to increment:', error);
  }
};
```

### 2. Wait for Transaction Confirmation

Use `useWaitForTransactionReceipt` to monitor when the transaction is mined:

```ts
import { useWaitForTransactionReceipt } from 'wagmi';

const {
  isLoading: isConfirming,
  isSuccess: isConfirmed,
  data: receipt,
} = useWaitForTransactionReceipt({
  hash: txHash,
  chainId,
});
```

### 3. Refetch After Confirmation

When the transaction is confirmed, invalidate queries to fetch the new value:

```ts
useEffect(() => {
  if (isConfirmed && receipt) {
    // Refetch the counter value
    queryClient.invalidateQueries({ queryKey });

    // Show confirmation toast
    toast.success('Transaction confirmed!', {
      description: `Counter updated successfully. Block: ${receipt.blockNumber}`,
    });

    // Clear transaction hash
    setTxHash(undefined);
  }
}, [isConfirmed, receipt, queryClient, queryKey]);
```

### 4. Update UI States

Show different UI states for each phase:

```tsx
// Combined processing state
const isProcessing = isIncrementing || isIncrementingBy || isConfirming;

return (
  <>
    {/* Show confirmation status */}
    {isConfirming && (
      <div className="text-amber-600 dark:text-amber-400">
        <Spinner />
        Waiting for blockchain confirmation...
      </div>
    )}

    {/* Button states */}
    <Button onClick={handleIncrement} disabled={isProcessing}>
      {isIncrementing ? (
        <>
          <Spinner />
          Sending transaction...
        </>
      ) : isConfirming ? (
        <>
          <Spinner />
          Confirming...
        </>
      ) : (
        'Increment by 1'
      )}
    </Button>
  </>
);
```

### 5. Update Toast Messages

Modify success messages to indicate the transaction is sent but not confirmed:

```ts
const incrementMutation = useOptimisticMutation<bigint>({
  queryKey,
  optimisticUpdate: (oldData) => {
    if (oldData) return oldData + BigInt(1);
    return BigInt(1);
  },
  successMessage: {
    title: 'Transaction sent!', // Changed from "Counter incremented!"
    description: 'Waiting for blockchain confirmation...',
  },
  refetchOnSuccess: false, // Don't refetch yet, wait for confirmation
});
```

## Complete Example

Here's the full implementation from `use-counter-ui.ts`:

```ts
import { toast } from 'sonner';
import { useChainId, useWaitForTransactionReceipt } from 'wagmi';

import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

export const useCounterUI = () => {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const chainId = useChainId();
  const queryClient = useQueryClient();

  // Read counter value
  const { data: counterValue, queryKey } = useReadCounterX({ chainId });

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
  });

  // Optimistic mutation
  const incrementMutation = useOptimisticMutation<bigint>({
    queryKey,
    optimisticUpdate: (oldData) => oldData + BigInt(1),
    successMessage: {
      title: 'Transaction sent!',
      description: 'Waiting for blockchain confirmation...',
    },
    refetchOnSuccess: false, // Wait for confirmation
  });

  // Write operation
  const { writeContractAsync: increment, isPending: isIncrementing } = useWriteCounterInc({
    mutation: incrementMutation.callbacks,
  });

  // Handle confirmation
  useEffect(() => {
    if (isConfirmed && receipt) {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Transaction confirmed!', {
        description: `Counter updated. Block: ${receipt.blockNumber}`,
      });
      setTxHash(undefined);
    }
  }, [isConfirmed, receipt, queryClient, queryKey]);

  const handleIncrement = async () => {
    try {
      const hash = await increment({ args: [] });
      setTxHash(hash); // Track confirmation
    } catch (error) {
      console.error('Failed to increment:', error);
    }
  };

  return {
    handleIncrement,
    isIncrementing, // Sending transaction
    isConfirming, // Waiting for confirmation
    isConfirmed, // Confirmed
    counterValue,
  };
};
```

## User Experience Flow

### State 1: Idle

```
┌─────────────────────┐
│  Counter Value: 5   │
│                     │
│ [Increment by 1]    │
└─────────────────────┘
```

### State 2: Sending Transaction

```
┌─────────────────────┐
│  Counter Value: 6   │ ← Optimistic update
│                     │
│ [⟳ Sending...]      │ ← Button disabled
└─────────────────────┘
Toast: "Transaction sent! Waiting for confirmation..."
```

### State 3: Confirming

```
┌─────────────────────┐
│  Counter Value: 6   │ ← Still optimistic
│                     │
│ 🔄 Confirming...    │ ← Status indicator
│ [⟳ Confirming...]   │ ← Button still disabled
└─────────────────────┘
```

### State 4: Confirmed

```
┌─────────────────────┐
│  Counter Value: 6   │ ← Real value from blockchain
│                     │
│ [Increment by 1]    │ ← Button re-enabled
└─────────────────────┘
Toast: "Transaction confirmed! Block: 12345"
```

## Benefits

### ✅ Clear User Feedback

- Users see exactly what's happening at each stage
- No confusion about why the value hasn't updated
- Professional UX matching production dApps

### ✅ Proper Data Synchronization

- Query refetches after confirmation, not just transaction send
- Optimistic updates for instant feedback
- Real blockchain value replaces optimistic value after confirmation

### ✅ Error Handling

- Optimistic updates roll back on error
- Clear error messages if transaction fails
- No stuck loading states

### ✅ Multiple Transactions

- Transaction hash is cleared after confirmation
- Ready for next transaction immediately
- No interference between consecutive transactions

## Advanced Patterns

### Pattern 1: Transaction Progress Bar

Show detailed progress:

```tsx
function TransactionProgress({ isIncrementing, isConfirming, isConfirmed }) {
  const steps = [
    { label: 'Sending', active: isIncrementing },
    { label: 'Confirming', active: isConfirming },
    { label: 'Confirmed', active: isConfirmed },
  ];

  return (
    <div className="flex gap-2">
      {steps.map((step, i) => (
        <div key={i} className={step.active ? 'text-primary' : 'text-muted'}>
          {step.label}
        </div>
      ))}
    </div>
  );
}
```

### Pattern 2: Block Explorer Link

Link to transaction on block explorer:

```tsx
{
  txHash && (
    <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
      View on Etherscan →
    </a>
  );
}
```

### Pattern 3: Estimated Confirmation Time

Show estimated time:

```tsx
{
  isConfirming && <div>Confirming... (~15 seconds)</div>;
}
```

### Pattern 4: Transaction History

Track multiple transactions:

```ts
const [txHistory, setTxHistory] = useState<
  Array<{
    hash: string;
    status: 'pending' | 'confirmed';
    timestamp: number;
  }>
>([]);

useEffect(() => {
  if (isConfirmed && receipt) {
    setTxHistory((prev) => [
      ...prev,
      {
        hash: txHash!,
        status: 'confirmed',
        timestamp: Date.now(),
      },
    ]);
  }
}, [isConfirmed, receipt, txHash]);
```

## Common Issues

### Issue 1: Value Never Updates

**Problem**: Query doesn't refetch after confirmation

**Solution**: Ensure `queryClient.invalidateQueries()` is called in the confirmation useEffect

```ts
useEffect(() => {
  if (isConfirmed && receipt) {
    queryClient.invalidateQueries({ queryKey }); // ← Must call this!
  }
}, [isConfirmed, receipt, queryClient, queryKey]);
```

### Issue 2: Multiple Toasts

**Problem**: Success toast shows multiple times

**Solution**: Clear txHash after showing confirmation toast

```ts
useEffect(() => {
  if (isConfirmed && receipt) {
    toast.success('Confirmed!');
    setTxHash(undefined); // ← Clear to prevent re-triggering
  }
}, [isConfirmed, receipt]);
```

### Issue 3: Stuck in Confirming State

**Problem**: Transaction hash never confirms

**Solution**: Add timeout and error handling

```ts
const { isError: confirmError } = useWaitForTransactionReceipt({
  hash: txHash,
  chainId,
});

useEffect(() => {
  if (confirmError) {
    toast.error('Transaction failed to confirm');
    setTxHash(undefined); // Clear and allow retry
  }
}, [confirmError]);
```

### Issue 4: Race Condition with Multiple Transactions

**Problem**: Second transaction sent before first confirms

**Solution**: Disable actions while confirming

```tsx
<Button
  onClick={handleIncrement}
  disabled={isIncrementing || isConfirming} // ← Both states
>
  Increment
</Button>
```

## Testing

### Unit Test Example

```ts
import { act, renderHook } from '@testing-library/react';

import { useCounterUI } from './use-counter-ui';

test('handles complete transaction lifecycle', async () => {
  const { result } = renderHook(() => useCounterUI());

  // Initial state
  expect(result.current.isIncrementing).toBe(false);
  expect(result.current.isConfirming).toBe(false);

  // Send transaction
  await act(async () => {
    await result.current.handleIncrement();
  });

  // Should be confirming
  expect(result.current.isConfirming).toBe(true);

  // Wait for confirmation
  await waitFor(() => {
    expect(result.current.isConfirmed).toBe(true);
  });

  // Should refetch and clear state
  expect(result.current.isConfirming).toBe(false);
});
```

## Best Practices

### ✅ DO

1. **Always wait for confirmation** before showing final success
2. **Use optimistic updates** for instant feedback
3. **Refetch after confirmation** to get real blockchain value
4. **Show clear status indicators** for each phase
5. **Disable actions** while transaction is processing
6. **Clear transaction hash** after confirmation
7. **Handle errors** at each stage

### ❌ DON'T

1. **Don't skip confirmation waiting** - Users need to know when it's final
2. **Don't refetch immediately** - Wait for transaction to be mined
3. **Don't show "Success"** until transaction is confirmed
4. **Don't allow multiple simultaneous transactions** - Can cause confusion
5. **Don't forget to clear txHash** - Prevents memory leaks and re-triggers
6. **Don't ignore optimistic updates** - They improve perceived performance

## Related Documentation

- [Optimistic Mutations](./OPTIMISTIC_MUTATIONS.md)
- [Smart Contract Integration](./SMART_CONTRACT_INTEGRATION.md)
- [Toast Implementation](./TOAST_IMPLEMENTATION.md)
- [Loading Components](./LOADING_COMPONENTS.md)

## Summary

Proper transaction lifecycle handling is crucial for Web3 applications:

- ✅ **3 distinct states**: Sending → Confirming → Confirmed
- ✅ **Clear user feedback** at each stage
- ✅ **Optimistic updates** for instant perceived performance
- ✅ **Real data** after blockchain confirmation
- ✅ **Professional UX** that doesn't confuse users

By implementing this pattern, users always know what's happening with their transactions and see accurate data once it's confirmed on the blockchain! 🎉
