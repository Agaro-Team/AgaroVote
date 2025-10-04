# Toast/Sonner Implementation Guide

## Overview

This document describes the implementation of the Sonner toast notification system in the AgaroVote frontend application.

## Installation

The Sonner component was installed using the shadcn CLI:

```bash
npx shadcn@latest add @shadcn/sonner
```

This command:

- Installed the `sonner` package (v2.0.7)
- Created the `app/components/ui/sonner.tsx` component
- Configured it to work with our custom theme provider

## Components

### 1. Toaster Component (`app/components/ui/sonner.tsx`)

The Toaster component is integrated with our custom theme provider and provides toast notifications that automatically adapt to light/dark mode.

```tsx
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '~/lib/theme-provider';

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps['theme']}
      className="toaster group"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      }}
      {...props}
    />
  );
};

export { Toaster };
```

### 2. Root Integration (`app/root.tsx`)

The Toaster component is added to the root layout inside the provider hierarchy:

```tsx
export default function AppWithProviders({ loaderData }: Route.ComponentProps) {
  return (
    <ThemeProvider initialTheme={loaderData?.theme || 'system'}>
      <Web3Provider>
        <QueryClientProvider>
          <Outlet />
          <Toaster />
        </QueryClientProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}
```

## Usage

### Basic Toast

```tsx
import { toast } from 'sonner';

toast('Event has been created', {
  description: 'Sunday, December 03, 2023 at 9:00 AM',
});
```

### Toast Variants

#### Success Toast

```tsx
toast.success('Success!', {
  description: 'Your action was completed successfully.',
});
```

#### Error Toast

```tsx
toast.error('Error!', {
  description: 'Something went wrong. Please try again.',
});
```

#### Info Toast

```tsx
toast.info('Info', {
  description: 'This is an informational message.',
});
```

#### Warning Toast

```tsx
toast.warning('Warning!', {
  description: 'Please be careful with this action.',
});
```

### Toast with Action

```tsx
toast('Event has been created', {
  description: 'Sunday, December 03, 2023 at 9:00 AM',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo clicked'),
  },
});
```

### Promise Toast

```tsx
const promise = new Promise((resolve) => setTimeout(resolve, 2000));

toast.promise(promise, {
  loading: 'Loading...',
  success: 'Data loaded successfully!',
  error: 'Failed to load data',
});
```

## Real-World Examples

### Counter UI Integration

The counter UI component has been updated to show toast notifications on success and error:

```tsx
const { writeContractAsync: increment, isPending: isIncrementing } = useWriteCounterInc({
  mutation: {
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey });
      toast.success('Counter incremented!', {
        description: 'The counter value has been increased by 1.',
      });
    },
    onError: (error) => {
      toast.error('Failed to increment counter', {
        description: error.message || 'An error occurred while incrementing the counter.',
      });
    },
  },
});
```

### Demo Component

A complete demo component is available at `app/components/toast-demo.tsx` showcasing all toast variants.

## Theme Integration

The toast component automatically adapts to the application's theme (light/dark mode) through the custom `ThemeProvider`. The `resolvedTheme` from the provider ensures the toast matches the current theme, including system preference detection.

## Available Shadcn Registry Components

The shadcn registry currently contains **423 components** including:

- UI components (accordion, alert, button, card, etc.)
- Form components (checkbox, input, select, etc.)
- Navigation components (breadcrumb, menu, tabs, etc.)
- Data display (table, chart, badge, etc.)
- Feedback (toast/sonner, dialog, alert, etc.)
- And many more...

To view all available components:

```bash
npx shadcn@latest view @shadcn
```

To search for specific components:

```bash
npx shadcn@latest search <query>
```

## Best Practices

1. **Keep descriptions concise** - Users should be able to read the toast quickly
2. **Use appropriate variants** - Choose the right toast type (success, error, info, warning)
3. **Provide actionable feedback** - When showing errors, explain what went wrong
4. **Consider adding actions** - For destructive operations, provide an "Undo" option
5. **Use promise toasts** - For async operations to provide immediate feedback

## Resources

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [shadcn/ui Toast Documentation](https://ui.shadcn.com/docs/components/sonner)
