# Optimistic Mutations Guide

## Overview

The `useOptimisticMutation` hook provides a reusable pattern for handling optimistic UI updates in React applications. It automatically manages:

- ✅ Query cancellation
- ✅ Cache snapshots for rollback
- ✅ Optimistic cache updates
- ✅ Automatic refetching on success
- ✅ Automatic rollback on error
- ✅ Toast notifications
- ✅ Custom callbacks

## Why Optimistic Updates?

Optimistic updates improve perceived performance by updating the UI immediately, before waiting for the server response. This creates a more responsive user experience, especially important for Web3 applications where blockchain transactions can take several seconds.

## Installation

The hook is located at `app/hooks/use-optimistic-mutation.ts` and is ready to use throughout your application.

## Basic Usage

### Simple Example

```tsx
import { useOptimisticMutation } from '~/hooks/use-optimistic-mutation';

function MyComponent() {
  const { data, queryKey } = useReadCounterX();

  // Create optimistic mutation
  const mutation = useOptimisticMutation<bigint>({
    queryKey,
    optimisticUpdate: (oldData) => {
      if (oldData) return oldData + BigInt(1);
      return BigInt(1);
    },
    successMessage: 'Counter incremented!',
    errorMessage: 'Failed to increment counter',
  });

  // Use with wagmi hooks
  const { writeContractAsync, isPending } = useWriteCounterInc({
    mutation: mutation.callbacks,
  });

  return (
    <button onClick={() => writeContractAsync({ args: [] })} disabled={isPending}>
      Increment
    </button>
  );
}
```

## Configuration Options

### Core Options

#### `queryKey` (required)

The React Query key to invalidate and refetch.

```tsx
const mutation = useOptimisticMutation({
  queryKey: ['counter', address],
  // ...
});
```

#### `optimisticUpdate` (optional)

Function to compute the optimistic value before the mutation completes.

```tsx
const mutation = useOptimisticMutation<bigint>({
  queryKey,
  optimisticUpdate: (oldData, variables) => {
    if (oldData) return oldData + BigInt(1);
    return BigInt(1);
  },
});
```

#### `successMessage` (optional)

Toast notification to show on success. Can be a string or an object with title and description.

```tsx
// Simple string
successMessage: 'Counter incremented!'

// Object with title and description
successMessage: {
  title: 'Success!',
  description: 'The counter has been incremented.',
}

// Dynamic description
successMessage: {
  title: 'Counter incremented!',
  description: (data, variables) => {
    const [value] = variables.args as [bigint];
    return `Incremented by ${value.toString()}`;
  },
}
```

#### `errorMessage` (optional)

Toast notification to show on error.

```tsx
// Simple string
errorMessage: 'Operation failed'

// Object with title and description
errorMessage: {
  title: 'Failed to increment counter',
  description: 'An error occurred. Please try again.',
}
```

### Advanced Options

#### `showToast` (default: `true`)

Whether to show toast notifications.

```tsx
const mutation = useOptimisticMutation({
  queryKey,
  showToast: false, // Disable toast notifications
});
```

#### `refetchOnSuccess` (default: `true`)

Whether to refetch queries after a successful mutation.

```tsx
const mutation = useOptimisticMutation({
  queryKey,
  refetchOnSuccess: false, // Don't refetch, rely on optimistic update
});
```

#### `rollbackOnError` (default: `true`)

Whether to rollback the optimistic update on error.

```tsx
const mutation = useOptimisticMutation({
  queryKey,
  rollbackOnError: true, // Restore previous data on error
});
```

#### Custom Callbacks

Add custom logic alongside the built-in behavior.

```tsx
const mutation = useOptimisticMutation({
  queryKey,
  onMutate: async (variables) => {
    console.log('Starting mutation with:', variables);
  },
  onSuccess: async (data, variables, context) => {
    console.log('Mutation succeeded:', data);
    // Custom success logic
  },
  onError: async (error, variables, context) => {
    console.error('Mutation failed:', error);
    // Custom error handling
  },
});
```

## Helper Functions

### `createIncrementUpdater`

Helper for numeric increment operations.

```tsx
import { createIncrementUpdater, useOptimisticMutation } from '~/hooks/use-optimistic-mutation';

const mutation = useOptimisticMutation<bigint>({
  queryKey,
  optimisticUpdate: createIncrementUpdater<bigint>((vars) => vars.args[0] as bigint),
  successMessage: 'Incremented!',
});
```

### `createDecrementUpdater`

Helper for numeric decrement operations.

```tsx
import { createDecrementUpdater, useOptimisticMutation } from '~/hooks/use-optimistic-mutation';

const mutation = useOptimisticMutation<bigint>({
  queryKey,
  optimisticUpdate: createDecrementUpdater<bigint>((vars) => vars.args[0] as bigint),
  successMessage: 'Decremented!',
});
```

### `createArrayAppendUpdater`

Helper for appending items to arrays.

```tsx
import { createArrayAppendUpdater, useOptimisticMutation } from '~/hooks/use-optimistic-mutation';

interface Todo {
  id: string;
  text: string;
}

const mutation = useOptimisticMutation<Todo[]>({
  queryKey,
  optimisticUpdate: createArrayAppendUpdater((vars) => ({
    id: crypto.randomUUID(),
    text: vars.text,
  })),
  successMessage: 'Todo added!',
});
```

### `createArrayRemoveUpdater`

Helper for removing items from arrays.

```tsx
import { createArrayRemoveUpdater, useOptimisticMutation } from '~/hooks/use-optimistic-mutation';

const mutation = useOptimisticMutation<Todo[]>({
  queryKey,
  optimisticUpdate: createArrayRemoveUpdater(
    (vars) => vars.todoId,
    (item) => item.id
  ),
  successMessage: 'Todo removed!',
});
```

### `createPropertyUpdater`

Helper for updating object properties.

```tsx
import { createPropertyUpdater, useOptimisticMutation } from '~/hooks/use-optimistic-mutation';

interface User {
  name: string;
  email: string;
  age: number;
}

const mutation = useOptimisticMutation<User>({
  queryKey,
  optimisticUpdate: createPropertyUpdater((vars) => ({
    name: vars.newName,
  })),
  successMessage: 'Profile updated!',
});
```

## Real-World Examples

### Counter Example (from counter-ui.tsx)

```tsx
export function CounterUI() {
  const { data: counterValue, queryKey } = useReadCounterX();

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

  const { writeContractAsync: increment, isPending: isIncrementing } = useWriteCounterInc({
    mutation: incrementMutation.callbacks,
  });

  const { writeContractAsync: incrementBy, isPending: isIncrementingBy } = useWriteCounterIncBy({
    mutation: incrementByMutation.callbacks,
  });

  return (
    <div>
      <p>Counter: {counterValue?.toString()}</p>
      <button onClick={() => increment({ args: [] })} disabled={isIncrementing}>
        Increment by 1
      </button>
      <button onClick={() => incrementBy({ args: [BigInt(5)] })} disabled={isIncrementingBy}>
        Increment by 5
      </button>
    </div>
  );
}
```

### Voting Example

```tsx
function VotingCard({ proposalId }: { proposalId: bigint }) {
  const { data: votes, queryKey } = useReadProposalVotes({ args: [proposalId] });

  const voteMutation = useOptimisticMutation<bigint>({
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
      description: 'Please try again or check your wallet.',
    },
  });

  const { writeContractAsync: vote, isPending } = useWriteVote({
    mutation: voteMutation.callbacks,
  });

  return (
    <div>
      <p>Current votes: {votes?.toString()}</p>
      <button onClick={() => vote({ args: [proposalId] })} disabled={isPending}>
        Vote
      </button>
    </div>
  );
}
```

### Todo List Example

```tsx
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

function TodoList() {
  const { data: todos = [], queryKey } = useGetTodos();

  // Add todo
  const addMutation = useOptimisticMutation<Todo[]>({
    queryKey,
    optimisticUpdate: createArrayAppendUpdater((vars) => ({
      id: crypto.randomUUID(),
      text: vars.text,
      completed: false,
    })),
    successMessage: 'Todo added!',
    errorMessage: 'Failed to add todo',
  });

  // Remove todo
  const removeMutation = useOptimisticMutation<Todo[]>({
    queryKey,
    optimisticUpdate: createArrayRemoveUpdater(
      (vars) => vars.todoId,
      (todo) => todo.id
    ),
    successMessage: 'Todo removed!',
    errorMessage: 'Failed to remove todo',
  });

  const { mutateAsync: addTodo } = useMutation({
    mutationFn: async (text: string) => {
      // API call
    },
    ...addMutation.callbacks,
  });

  const { mutateAsync: removeTodo } = useMutation({
    mutationFn: async (todoId: string) => {
      // API call
    },
    ...removeMutation.callbacks,
  });

  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => removeTodo(todo.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

### 1. Always Handle Errors

The hook automatically rolls back on error, but you should still handle errors appropriately:

```tsx
const mutation = useOptimisticMutation({
  queryKey,
  errorMessage: {
    title: 'Operation failed',
    description: 'Please check your connection and try again.',
  },
  onError: async (error) => {
    // Log error for debugging
    console.error('Mutation error:', error);
    // Optionally notify error tracking service
  },
});
```

### 2. Provide Clear Feedback

Use descriptive messages so users understand what happened:

```tsx
successMessage: {
  title: 'Counter incremented!',
  description: (_, variables) => {
    const [value] = variables.args as [bigint];
    return `Successfully increased counter by ${value.toString()}`;
  },
}
```

### 3. Use Helper Functions

Helper functions reduce boilerplate and prevent errors:

```tsx
// Good - using helper
optimisticUpdate: createIncrementUpdater<bigint>((vars) => vars.args[0] as bigint);

// Avoid - manual implementation
optimisticUpdate: (oldData, variables) => {
  const [value] = variables.args as [bigint];
  if (oldData) return oldData + value;
  return value;
};
```

### 4. Type Safety

Always provide proper type parameters:

```tsx
// Good - typed properly
const mutation = useOptimisticMutation<bigint>({
  queryKey,
  optimisticUpdate: (oldData) => oldData + BigInt(1),
});

// Avoid - no types
const mutation = useOptimisticMutation({
  queryKey,
  optimisticUpdate: (oldData) => oldData + 1, // Type error!
});
```

### 5. Conditional Optimistic Updates

Not all mutations need optimistic updates. Skip them when the calculation is complex or uncertain:

```tsx
// No optimistic update - wait for server response
const mutation = useOptimisticMutation({
  queryKey,
  // No optimisticUpdate provided
  successMessage: 'Data saved!',
  errorMessage: 'Failed to save',
});
```

## Comparison: Before and After

### Before (Manual Implementation)

```tsx
const queryClient = useQueryClient();

const { writeContractAsync, isPending } = useWriteCounterInc({
  mutation: {
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const oldData = await queryClient.getQueryData(queryKey);
      await queryClient.setQueryData(queryKey, (oldData: bigint) => {
        if (oldData) return oldData + BigInt(1);
        return BigInt(1);
      });
      return { oldData: oldData as bigint };
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey });
      toast.success('Counter incremented!', {
        description: 'The counter value has been increased by 1.',
      });
    },
    onError: (error, variables, context) => {
      if (context?.oldData) {
        queryClient.setQueryData(queryKey, context.oldData);
      }
      toast.error('Failed to increment counter', {
        description: error.message,
      });
    },
  },
});
```

### After (Using Hook)

```tsx
const mutation = useOptimisticMutation<bigint>({
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
  },
});

const { writeContractAsync, isPending } = useWriteCounterInc({
  mutation: mutation.callbacks,
});
```

**Benefits:**

- ✅ 80% less code
- ✅ Consistent error handling
- ✅ Reusable across the app
- ✅ Easier to test
- ✅ Less room for bugs

## Troubleshooting

### Issue: Optimistic update not visible

**Cause:** The query key might not match, or React Query isn't configured properly.

**Solution:** Verify the query key matches exactly:

```tsx
const { queryKey } = useReadCounterX();
console.log('Query key:', queryKey);

const mutation = useOptimisticMutation({
  queryKey, // Use the same key
  // ...
});
```

### Issue: Data not refetching after success

**Cause:** `refetchOnSuccess` is set to false.

**Solution:** Enable refetching:

```tsx
const mutation = useOptimisticMutation({
  queryKey,
  refetchOnSuccess: true, // default
  // ...
});
```

### Issue: Toast not showing

**Cause:** `showToast` is set to false, or Toaster component is not in the app.

**Solution:** Verify Toaster is in `root.tsx` and enable toasts:

```tsx
const mutation = useOptimisticMutation({
  queryKey,
  showToast: true, // default
  successMessage: 'Success!',
  // ...
});
```

## Related Documentation

- [Toast Implementation](./TOAST_IMPLEMENTATION.md)
- [Web3 Architecture](./WEB3_ARCHITECTURE.md)
- [Smart Contract Integration](./SMART_CONTRACT_INTEGRATION.md)

## Resources

- [React Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Wagmi Documentation](https://wagmi.sh/)
