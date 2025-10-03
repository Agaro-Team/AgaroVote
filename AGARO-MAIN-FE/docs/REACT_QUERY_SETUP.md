# TanStack React Query Setup

This project has been configured with TanStack React Query for efficient data fetching, caching, and synchronization.

## 🚀 What's Included

### Core Setup

- **QueryClient** with optimized default options
- **QueryClientProvider** wrapping the entire app
- **React Query Devtools** for development debugging
- Centralized configuration in `app/lib/query-client.ts`

### Utility Files

- `app/lib/api.ts` - API client with error handling
- `app/lib/hooks.ts` - Custom hooks and utilities
- `app/lib/query-client.ts` - Query client configuration

## 📁 File Structure

```
app/
├── lib/
│   ├── query-client.ts    # QueryClient configuration
│   ├── api.ts             # API utilities and error handling
│   └── hooks.ts           # Custom React Query hooks
├── root.tsx               # QueryClientProvider setup
└── routes/
    └── home.tsx           # Example usage
```

## 🔧 Configuration

### Default Options

- **Stale Time**: 5 minutes (data stays fresh)
- **Garbage Collection Time**: 10 minutes (cache cleanup)
- **Retry Logic**: Smart retry for network errors, no retry for 4xx errors
- **Mutations**: No automatic retry

### Query Keys Factory

Use the centralized `queryKeys` object for consistent query key management:

```typescript
// In app/lib/query-client.ts
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userPosts: (userId: string) => ['users', userId, 'posts'] as const,
} as const;
```

## 🎯 Usage Examples

### Basic Query

```typescript
import { useQuery } from "@tanstack/react-query";

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data?.map(post => <div key={post.id}>{post.title}</div>)}</div>;
}
```

### Mutation with Cache Invalidation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost) =>
      fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(newPost),
      }),
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ title: 'New Post' })}>
      Create Post
    </button>
  );
}
```

### Using Custom Hooks

```typescript
import { useExampleMutation, useExampleQuery } from '~/lib/hooks';

function MyComponent() {
  const { data, isLoading } = useExampleQuery();
  const mutation = useExampleMutation();

  // Your component logic
}
```

## 🛠 Development Tools

### React Query Devtools

- Automatically included in development
- Access via the floating button in the bottom-left corner
- View query states, cache, and performance metrics

### Error Handling

The setup includes comprehensive error handling:

- Network errors are automatically retried
- 4xx errors are not retried (client errors)
- Custom `ApiError` class for structured error handling

## 🔄 Cache Management

### Automatic Cache Management

- Queries are automatically cached and deduplicated
- Background refetching keeps data fresh
- Garbage collection removes unused data

### Manual Cache Control

```typescript
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();

  // Invalidate specific queries
  queryClient.invalidateQueries({ queryKey: ['posts'] });

  // Prefetch data
  queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
  });

  // Set query data directly
  queryClient.setQueryData(['user', '123'], userData);
}
```

## 🚀 Best Practices

1. **Use Query Keys Factory**: Centralize query keys for consistency
2. **Custom Hooks**: Create reusable hooks for common queries
3. **Error Boundaries**: Wrap components with error boundaries
4. **Loading States**: Always handle loading and error states
5. **Optimistic Updates**: Use mutations for immediate UI updates
6. **Prefetching**: Prefetch data for better UX

## 📚 Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query Devtools](https://tanstack.com/query/latest/docs/react/devtools)
- [Query Key Factory Pattern](https://tkdodo.eu/blog/effective-react-query-keys)

## 🎉 Example Implementation

Check `app/routes/home.tsx` for a working example that fetches posts from JSONPlaceholder API and displays them with proper loading and error states.
