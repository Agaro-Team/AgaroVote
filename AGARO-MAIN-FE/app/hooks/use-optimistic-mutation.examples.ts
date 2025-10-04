/**
 * Optimistic Mutation Examples
 *
 * This file contains practical examples of using the useOptimisticMutation hook
 * for common use cases in the application.
 */
import {
  createArrayAppendUpdater,
  createArrayRemoveUpdater,
  createIncrementUpdater,
  createPropertyUpdater,
  useOptimisticMutation,
} from './use-optimistic-mutation';

// ============================================================================
// Example 1: Simple Counter Increment
// ============================================================================

export function useCounterIncrementMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation<bigint>({
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
      description: 'Please try again.',
    },
  });
}

// ============================================================================
// Example 2: Counter Increment with Custom Value
// ============================================================================

export function useCounterIncrementByMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation<bigint, any>({
    queryKey,
    optimisticUpdate: createIncrementUpdater<bigint>((vars) => vars.args[0] as bigint),
    successMessage: {
      title: 'Counter incremented!',
      description: (_, variables) => {
        const [value] = variables.args as [bigint];
        return `Incremented by ${value.toString()}`;
      },
    },
    errorMessage: {
      title: 'Failed to increment',
      description: 'An error occurred.',
    },
  });
}

// ============================================================================
// Example 3: Vote Casting
// ============================================================================

interface VoteVariables {
  proposalId: bigint;
  support: boolean;
}

export function useVoteMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation<bigint, VoteVariables>({
    queryKey,
    optimisticUpdate: (oldVotes) => {
      if (oldVotes) return oldVotes + BigInt(1);
      return BigInt(1);
    },
    successMessage: {
      title: 'Vote cast successfully!',
      description: 'Your vote has been recorded on the blockchain.',
    },
    errorMessage: {
      title: 'Failed to cast vote',
      description: 'Please check your wallet and try again.',
    },
  });
}

// ============================================================================
// Example 4: Proposal Creation (No Optimistic Update)
// ============================================================================

export function useCreateProposalMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation({
    queryKey,
    // No optimisticUpdate - wait for blockchain confirmation
    successMessage: {
      title: 'Proposal created!',
      description: 'Your proposal has been submitted to the blockchain.',
    },
    errorMessage: {
      title: 'Failed to create proposal',
      description: 'Please check your transaction and try again.',
    },
  });
}

// ============================================================================
// Example 5: Array Operations - Add Item
// ============================================================================

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export function useAddTodoMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation<Todo[], { text: string }>({
    queryKey,
    optimisticUpdate: createArrayAppendUpdater<Todo>((vars) => ({
      id: crypto.randomUUID() as string,
      text: vars.text,
      completed: false,
    })),
    successMessage: 'Todo added successfully!',
    errorMessage: 'Failed to add todo',
  });
}

// ============================================================================
// Example 6: Array Operations - Remove Item
// ============================================================================

export function useRemoveTodoMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation<Todo[], { todoId: string }>({
    queryKey,
    optimisticUpdate: createArrayRemoveUpdater(
      (vars) => vars.todoId,
      (todo) => todo.id
    ),
    successMessage: 'Todo removed!',
    errorMessage: 'Failed to remove todo',
  });
}

// ============================================================================
// Example 7: Object Property Update
// ============================================================================

interface UserProfile {
  name: string;
  email: string;
  bio: string;
}

export function useUpdateProfileMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation<UserProfile, { name?: string; bio?: string }>({
    queryKey,
    optimisticUpdate: createPropertyUpdater((vars) => ({
      ...(vars.name && { name: vars.name }),
      ...(vars.bio && { bio: vars.bio }),
    })),
    successMessage: {
      title: 'Profile updated!',
      description: 'Your profile has been saved.',
    },
    errorMessage: {
      title: 'Failed to update profile',
      description: 'Please try again later.',
    },
  });
}

// ============================================================================
// Example 8: Custom Callbacks
// ============================================================================

export function useTransferTokensMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation<bigint, { to: string; amount: bigint }>({
    queryKey,
    optimisticUpdate: (oldBalance, vars) => {
      if (oldBalance && oldBalance >= vars.amount) {
        return oldBalance - vars.amount;
      }
      return oldBalance;
    },
    successMessage: {
      title: 'Transfer successful!',
      description: (_, vars) => `Sent ${vars.amount.toString()} tokens to ${vars.to}`,
    },
    errorMessage: {
      title: 'Transfer failed',
      description: 'Please check your balance and try again.',
    },
    onSuccess: async (data, variables) => {
      // Custom logic after successful transfer
      console.log('Transfer completed:', {
        to: variables.to,
        amount: variables.amount.toString(),
      });
    },
    onError: async (error, variables) => {
      // Custom error handling
      console.error('Transfer error:', error.message);
      // Could send to error tracking service
    },
  });
}

// ============================================================================
// Example 9: Silent Mutation (No Toast)
// ============================================================================

export function useBackgroundSyncMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation({
    queryKey,
    showToast: false, // No user notification
    refetchOnSuccess: true,
  });
}

// ============================================================================
// Example 10: Complex Optimistic Update
// ============================================================================

interface Proposal {
  id: bigint;
  title: string;
  votes: bigint;
  hasVoted: boolean;
  voters: string[];
}

export function useVoteOnProposalMutation(queryKey: readonly unknown[], userAddress: string) {
  return useOptimisticMutation<Proposal, { proposalId: bigint }>({
    queryKey,
    optimisticUpdate: (oldProposal) => {
      if (!oldProposal || oldProposal.hasVoted) {
        return oldProposal; // Don't update if already voted
      }

      return {
        ...oldProposal,
        votes: oldProposal.votes + BigInt(1),
        hasVoted: true,
        voters: [...oldProposal.voters, userAddress],
      };
    },
    successMessage: {
      title: 'Vote recorded!',
      description: (_, vars) => `Successfully voted on proposal #${vars.proposalId}`,
    },
    errorMessage: {
      title: 'Vote failed',
      description: 'Please try again or check if you have already voted.',
    },
  });
}

// ============================================================================
// Example 11: Conditional Optimistic Update
// ============================================================================

export function useSmartIncrementMutation(queryKey: readonly unknown[], maxValue: bigint) {
  return useOptimisticMutation<bigint, any>({
    queryKey,
    optimisticUpdate: (oldData, variables) => {
      if (!oldData) return BigInt(1);

      const [incrementBy] = variables.args as [bigint];
      const newValue = oldData + incrementBy;

      // Only update if new value doesn't exceed max
      if (newValue <= maxValue) {
        return newValue;
      }

      // Don't apply optimistic update if it would exceed max
      return oldData;
    },
    successMessage: 'Incremented successfully!',
    errorMessage: 'Failed to increment',
  });
}

// ============================================================================
// Example 12: Batch Operations
// ============================================================================

interface BatchVoteVariables {
  proposalIds: bigint[];
  support: boolean;
}

export function useBatchVoteMutation(queryKey: readonly unknown[]) {
  return useOptimisticMutation<bigint, BatchVoteVariables>({
    queryKey,
    // No optimistic update for batch operations
    // Too complex to predict outcome
    successMessage: {
      title: 'Votes cast!',
      description: (_, vars) => `Successfully voted on ${vars.proposalIds.length} proposals`,
    },
    errorMessage: {
      title: 'Batch vote failed',
      description: 'Some votes may not have been recorded.',
    },
    refetchOnSuccess: true,
  });
}
