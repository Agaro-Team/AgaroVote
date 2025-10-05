import { toast } from 'sonner';
import { useChainId } from 'wagmi';
import { useAppForm } from '~/components/form';
import {
  useReadCounterX,
  useWatchCounterIncrementEvent,
  useWriteCounterInc,
  useWriteCounterIncBy,
} from '~/lib/web3/contracts/generated';

import { useState } from 'react';

import { useWaitForTransactionReceiptEffect } from './use-web3';

export const useCounterUI = () => {
  const [events, setEvents] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const chainId = useChainId();

  // Read counter value - only query the connected chain
  const {
    data: counterValue,
    isLoading: isReading,
    refetch: refetchCounter,
  } = useReadCounterX({
    chainId,
  });

  // Write operations
  const { writeContractAsync: increment, isPending: isIncrementing } = useWriteCounterInc({});

  const { writeContractAsync: incrementBy, isPending: isIncrementingBy } = useWriteCounterIncBy({});

  // Handle transaction confirmation
  const { isConfirming, isConfirmed } = useWaitForTransactionReceiptEffect(txHash, (receipt) => {
    // Refetch the counter value after confirmation
    refetchCounter();

    // Show success toast
    toast.success('Transaction confirmed!', {
      description: `Counter updated successfully. Block: ${receipt.blockNumber}`,
    });

    // Clear transaction hash
    setTxHash(undefined);
  });

  // Watch for events - only watch the connected chain
  useWatchCounterIncrementEvent({
    chainId,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const newEvent = `Counter incremented by ${log.args.by} at block ${log.blockNumber}`;
        setEvents((prev) => [newEvent, ...prev.slice(0, 4)]); // Keep last 5 events
      });
    },
  });

  // TanStack Form for increment by custom value
  const incrementByForm = useAppForm({
    defaultValues: {
      value: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const bigIntValue = BigInt(value.value);
        const hash = await incrementBy({
          args: [bigIntValue],
        });
        // Store transaction hash to track confirmation
        setTxHash(hash);
        // Reset form on success
        incrementByForm.reset();
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to increment by custom value:', error);
          toast.error('Failed to increment by custom value', {
            description:
              error.message || 'An error occurred while incrementing the counter by custom value.',
          });
        }
      }
    },
  });

  const handleIncrement = async () => {
    try {
      const hash = await increment({
        args: [],
      });
      // Store transaction hash to track confirmation
      setTxHash(hash);
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to increment', {
          description: error.message || 'An error occurred while incrementing the counter.',
        });
      }
    }
  };

  const handleIncrementBy = async () => {
    try {
      await incrementByForm.handleSubmit();
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to increment by custom value', {
          description:
            error.message || 'An error occurred while incrementing the counter by custom value.',
        });
      }
    }
  };

  return {
    handleIncrement,
    handleIncrementBy,
    isIncrementing,
    isIncrementingBy,
    isConfirming, // New: Transaction confirmation state
    isConfirmed, // New: Whether transaction is confirmed
    events,
    counterValue,
    isReading,
    incrementByForm,
  };
};
