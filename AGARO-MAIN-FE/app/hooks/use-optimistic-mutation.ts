/**
 * Custom Hook for Optimistic Mutations
 *
 * This hook provides a reusable pattern for handling optimistic updates in mutations.
 * It automatically handles:
 * - Canceling ongoing queries
 * - Saving old data for rollback
 * - Optimistically updating the cache
 * - Showing success/error toasts
 * - Refetching data on success
 * - Rolling back on error
 *
 * @example
 * ```tsx
 * const mutation = useOptimisticMutation({
 *   queryKey,
 *   optimisticUpdate: (oldValue, variables) => oldValue + variables.amount,
 *   successMessage: 'Counter incremented!',
 *   errorMessage: 'Failed to increment counter',
 * });
 *
 * const { writeContractAsync } = useWriteContract({
 *   mutation: mutation.callbacks,
 * });
 * ```
 */
import { toast } from 'sonner';

import { useQueryClient } from '@tanstack/react-query';

interface OptimisticMutationConfig<TData = unknown, TVariables = unknown, TContext = unknown> {
  /**
   * The query key to invalidate and refetch
   */
  queryKey: readonly unknown[];

  /**
   * Function to compute the optimistic value
   * @param oldData - The current cached data
   * @param variables - The mutation variables
   * @returns The optimistically updated data
   */
  optimisticUpdate?: (oldData: TData | undefined, variables: TVariables) => TData | undefined;

  /**
   * Success toast configuration
   */
  successMessage?:
    | string
    | {
        title: string;
        description?: string | ((data: unknown, variables: TVariables) => string);
      };

  /**
   * Error toast configuration
   */
  errorMessage?:
    | string
    | {
        title: string;
        description?: string;
      };

  /**
   * Whether to show toast notifications (default: true)
   */
  showToast?: boolean;

  /**
   * Custom onSuccess callback
   */
  onSuccess?: (data: unknown, variables: TVariables, context?: TContext) => void | Promise<void>;

  /**
   * Custom onError callback
   */
  onError?: (error: Error, variables: TVariables, context?: TContext) => void | Promise<void>;

  /**
   * Custom onMutate callback (runs before optimistic update)
   */
  onMutate?: (variables: TVariables) => void | Promise<void>;

  /**
   * Whether to refetch queries on success (default: true)
   */
  refetchOnSuccess?: boolean;

  /**
   * Whether to rollback on error (default: true)
   */
  rollbackOnError?: boolean;
}

interface MutationContext<TData = unknown> {
  oldData?: TData;
}

/**
 * Hook for handling optimistic mutations with automatic cache management and toast notifications
 */
export function useOptimisticMutation<TData = unknown, TVariables = unknown>({
  queryKey,
  optimisticUpdate,
  successMessage,
  errorMessage,
  showToast = true,
  onSuccess: customOnSuccess,
  onError: customOnError,
  onMutate: customOnMutate,
  refetchOnSuccess = true,
  rollbackOnError = true,
}: OptimisticMutationConfig<TData, TVariables, MutationContext<TData>>) {
  const queryClient = useQueryClient();

  const callbacks = {
    onMutate: async (variables: TVariables) => {
      // Run custom onMutate if provided
      if (customOnMutate) {
        await customOnMutate(variables);
      }

      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const oldData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update the cache if updater function is provided
      if (optimisticUpdate && oldData !== undefined) {
        const newData = optimisticUpdate(oldData, variables);
        if (newData !== undefined) {
          queryClient.setQueryData<TData>(queryKey, newData);
        }
      }

      // Return context with the snapshotted value for rollback
      return { oldData } as MutationContext<TData>;
    },

    onSuccess: async (data: unknown, variables: TVariables, context?: MutationContext<TData>) => {
      // Refetch queries to ensure consistency
      if (refetchOnSuccess) {
        await queryClient.invalidateQueries({ queryKey });
      }

      // Show success toast
      if (showToast && successMessage) {
        if (typeof successMessage === 'string') {
          toast.success(successMessage);
        } else {
          const description =
            typeof successMessage.description === 'function'
              ? successMessage.description(data, variables)
              : successMessage.description;

          toast.success(successMessage.title, {
            description,
          });
        }
      }

      // Run custom onSuccess if provided
      if (customOnSuccess) {
        await customOnSuccess(data, variables, context);
      }
    },

    onError: async (error: Error, variables: TVariables, context?: MutationContext<TData>) => {
      // Rollback to the previous value on error
      if (rollbackOnError && context?.oldData !== undefined) {
        queryClient.setQueryData<TData>(queryKey, context.oldData);
      }

      // Show error toast
      if (showToast && errorMessage) {
        if (typeof errorMessage === 'string') {
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage.title, {
            description: errorMessage.description || error.message,
          });
        }
      }

      // Run custom onError if provided
      if (customOnError) {
        await customOnError(error, variables, context);
      }
    },
  };

  return {
    callbacks,
    queryClient,
  };
}

/**
 * Helper function to create an optimistic updater for numeric increments
 * Useful for counter-like operations
 *
 * @example
 * ```tsx
 * const mutation = useOptimisticMutation({
 *   queryKey,
 *   optimisticUpdate: createIncrementUpdater<bigint>((vars) => vars.args[0] as bigint),
 *   successMessage: 'Incremented!',
 * });
 * ```
 */
export function createIncrementUpdater<T extends number | bigint>(
  getIncrementValue: (variables: any) => T
) {
  return (oldData: T | undefined, variables: any): T | undefined => {
    if (oldData === undefined) return undefined;

    const incrementValue = getIncrementValue(variables);

    // Handle bigint
    if (typeof oldData === 'bigint' && typeof incrementValue === 'bigint') {
      return (oldData + incrementValue) as T;
    }

    // Handle number
    if (typeof oldData === 'number' && typeof incrementValue === 'number') {
      return (oldData + incrementValue) as T;
    }

    return oldData;
  };
}

/**
 * Helper function to create an optimistic updater for decrement operations
 *
 * @example
 * ```tsx
 * const mutation = useOptimisticMutation({
 *   queryKey,
 *   optimisticUpdate: createDecrementUpdater<bigint>((vars) => vars.args[0] as bigint),
 *   successMessage: 'Decremented!',
 * });
 * ```
 */
export function createDecrementUpdater<T extends number | bigint>(
  getDecrementValue: (variables: any) => T
) {
  return (oldData: T | undefined, variables: any): T | undefined => {
    if (oldData === undefined) return undefined;

    const decrementValue = getDecrementValue(variables);

    // Handle bigint
    if (typeof oldData === 'bigint' && typeof decrementValue === 'bigint') {
      return (oldData - decrementValue) as T;
    }

    // Handle number
    if (typeof oldData === 'number' && typeof decrementValue === 'number') {
      return (oldData - decrementValue) as T;
    }

    return oldData;
  };
}

/**
 * Helper function to create an optimistic updater for array append operations
 *
 * @example
 * ```tsx
 * const mutation = useOptimisticMutation({
 *   queryKey,
 *   optimisticUpdate: createArrayAppendUpdater((vars) => vars.newItem),
 *   successMessage: 'Item added!',
 * });
 * ```
 */
export function createArrayAppendUpdater<T>(getNewItem: (variables: any) => T) {
  return (oldData: T[] | undefined, variables: any): T[] | undefined => {
    if (!oldData) return undefined;
    const newItem = getNewItem(variables);
    return [...oldData, newItem];
  };
}

/**
 * Helper function to create an optimistic updater for array remove operations
 *
 * @example
 * ```tsx
 * const mutation = useOptimisticMutation({
 *   queryKey,
 *   optimisticUpdate: createArrayRemoveUpdater((vars) => vars.itemId, (item) => item.id),
 *   successMessage: 'Item removed!',
 * });
 * ```
 */
export function createArrayRemoveUpdater<T>(
  getItemId: (variables: any) => string | number,
  getItemKey: (item: T) => string | number
) {
  return (oldData: T[] | undefined, variables: any): T[] | undefined => {
    if (!oldData) return undefined;
    const itemId = getItemId(variables);
    return oldData.filter((item) => getItemKey(item) !== itemId);
  };
}

/**
 * Helper function to create an optimistic updater for object property updates
 *
 * @example
 * ```tsx
 * const mutation = useOptimisticMutation({
 *   queryKey,
 *   optimisticUpdate: createPropertyUpdater((vars) => ({ count: vars.newCount })),
 *   successMessage: 'Updated!',
 * });
 * ```
 */
export function createPropertyUpdater<T extends Record<string, any>>(
  getUpdates: (variables: any) => Partial<T>
) {
  return (oldData: T | undefined, variables: any): T | undefined => {
    if (!oldData) return undefined;
    const updates = getUpdates(variables);
    return { ...oldData, ...updates };
  };
}
