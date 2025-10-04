import { useChainId } from 'wagmi';
import { useAppForm } from '~/components/form';
import {
  useReadCounterX,
  useWatchCounterIncrementEvent,
  useWriteCounterInc,
  useWriteCounterIncBy,
} from '~/lib/web3/contracts/generated';

import { useState } from 'react';

import { createIncrementUpdater, useOptimisticMutation } from './use-optimistic-mutation';

export const useCounterUI = () => {
  const [events, setEvents] = useState<string[]>([]);
  const chainId = useChainId();

  // Read counter value - only query the connected chain
  const {
    data: counterValue,
    isLoading: isReading,
    queryKey,
  } = useReadCounterX({
    chainId,
  });

  // Optimistic mutation for increment by 1
  const incrementMutation = useOptimisticMutation<bigint>({
    queryKey,
    optimisticUpdate: (oldData) => {
      if (oldData) return oldData + BigInt(1);
      return BigInt(1);
    },
    successMessage: {
      title: 'Counter incremented!',
      description: 'The counter value has been increased by 1.',
    },
    errorMessage: {
      title: 'Failed to increment counter',
      description: 'An error occurred while incrementing the counter.',
    },
  });

  // Optimistic mutation for increment by custom value
  const incrementByMutation = useOptimisticMutation<bigint, any>({
    queryKey,
    optimisticUpdate: createIncrementUpdater<bigint>((vars) => vars.args[0] as bigint),
    successMessage: {
      title: 'Counter incremented!',
      description: (_, variables) => {
        const [value] = variables.args as [bigint];
        return `The counter value has been increased by ${value.toString()}.`;
      },
    },
    errorMessage: {
      title: 'Failed to increment counter',
      description: 'An error occurred while incrementing the counter.',
    },
  });

  // Write operations
  const { writeContractAsync: increment, isPending: isIncrementing } = useWriteCounterInc({
    mutation: incrementMutation.callbacks,
  });

  const { writeContractAsync: incrementBy, isPending: isIncrementingBy } = useWriteCounterIncBy({
    mutation: incrementByMutation.callbacks,
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
        await incrementBy({
          args: [bigIntValue],
        });
        // Reset form on success
        incrementByForm.reset();
      } catch (error) {
        console.error('Failed to increment by custom value:', error);
      }
    },
  });

  const handleIncrement = async () => {
    try {
      await increment({
        args: [],
      });
    } catch (error) {
      console.error('Failed to increment:', error);
    }
  };

  return {
    handleIncrement,
    isIncrementing,
    isIncrementingBy,
    events,
    counterValue,
    isReading,
    incrementByForm,
  };
};
