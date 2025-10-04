# Form Composition Guide

## Overview

This document describes the implementation of [TanStack Form's composition pattern](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition) combined with [shadcn's Field components](https://ui.shadcn.com/docs/components/field) in the AgaroVote application. This powerful combination enables reusable, type-safe, and highly accessible form components that reduce verbosity and improve maintainability.

## Architecture

The form composition system combines two powerful patterns:

### TanStack Form Composition

1. **Form Context** - Shared contexts for field and form state
2. **Field Components** - Reusable input components (TextField, NumberField, etc.)
3. **Form Components** - Reusable form components (SubmitButton, etc.)
4. **Custom Form Hook** - Pre-bound hook with all components

### shadcn Field Primitives

5. **Field** - Core wrapper with orientation control and validation states
6. **FieldLabel** - Accessible label component
7. **FieldDescription** - Helper text for field guidance
8. **FieldError** - Accessible error messaging with multi-error support
9. **FieldGroup** - Layout wrapper for field collections
10. **FieldSet** - Semantic grouping with legend support

## File Structure

```
app/components/form/
├── form-context.tsx          # Field and form contexts
├── use-app-form.ts           # Custom form hook
├── index.ts                  # Public exports
├── fields/
│   ├── text-field.tsx        # Text input component
│   └── number-field.tsx      # Number input component
└── components/
    └── submit-button.tsx     # Submit button with loading state
```

## Core Components

### 1. Form Context (`form-context.tsx`)

Creates the contexts that enable component composition:

```tsx
import { createFormHookContexts } from '@tanstack/react-form';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();
```

### 2. Custom Form Hook (`use-app-form.ts`)

Binds all field and form components together:

```tsx
import { createFormHook } from '@tanstack/react-form';

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
  },
  formComponents: {
    SubmitButton,
  },
});
```

### 3. Field Components

#### TextField Component

```tsx
import { Input } from '~/components/ui/input';

import { useFieldContext } from '../form-context';

export function TextField({ label, placeholder, type = 'text' }) {
  const field = useFieldContext<string>();

  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Input
        type={type}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
      />
      {field.state.meta.errors.length > 0 && (
        <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
      )}
    </div>
  );
}
```

#### NumberField Component

Similar to TextField but optimized for number inputs with validation.

### 4. Form Components

#### SubmitButton Component

```tsx
import { useFormContext } from '../form-context';

export function SubmitButton({ label = 'Submit' }) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
      {({ isSubmitting }) => (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : label}
        </Button>
      )}
    </form.Subscribe>
  );
}
```

## shadcn Field Integration

Our field components now use shadcn's Field primitives under the hood, providing:

### Enhanced Accessibility

- **ARIA Support** - Automatic `aria-invalid`, `aria-describedby`, and `role` attributes
- **Semantic HTML** - Proper use of `fieldset`, `legend`, and `label` elements
- **Screen Reader Friendly** - Error messages properly announced to assistive technologies

### Flexible Layouts

```tsx
// Vertical layout (default)
<field.TextField label="Name" orientation="vertical" />

// Horizontal layout
<field.TextField label="Agree" orientation="horizontal" />

// Responsive layout (adapts to container)
<field.TextField label="Email" orientation="responsive" />
```

### Built-in Features

1. **Description Text** - Helper text that disappears when errors show
2. **Error Display** - Automatic error formatting with support for multiple errors
3. **Validation States** - Visual feedback via `data-invalid` attribute
4. **Orientation Control** - Vertical, horizontal, or responsive layouts

### Field Component Props

All our field components (TextField, NumberField) now support:

| Prop           | Type                                         | Description                                  |
| -------------- | -------------------------------------------- | -------------------------------------------- |
| `label`        | `string`                                     | Field label text                             |
| `description`  | `string`                                     | Helper text (hidden when errors are present) |
| `placeholder`  | `string`                                     | Input placeholder                            |
| `disabled`     | `boolean`                                    | Disable the field                            |
| `className`    | `string`                                     | Additional CSS classes for the input         |
| `orientation`  | `"vertical" \| "horizontal" \| "responsive"` | Layout direction                             |
| `type`         | `string` (TextField only)                    | Input type (text, email, password, etc.)     |
| `min/max/step` | `number` (NumberField only)                  | Number input constraints                     |

### Example with All Features

```tsx
<form.AppField
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value) return 'Email is required';
      if (!value.includes('@')) return 'Invalid email address';
      return undefined;
    },
  }}
>
  {(field) => (
    <field.TextField
      label="Email Address"
      description="We'll never share your email with anyone"
      placeholder="you@example.com"
      type="email"
      orientation="vertical"
    />
  )}
</form.AppField>
```

This will render:

- Label with proper `htmlFor` attribute
- Input with validation states
- Description text (hides when error appears)
- Error message (appears when validation fails)
- Full accessibility support

## Usage Examples

### Basic Usage

```tsx
import { useAppForm } from '~/components/form';

function MyForm() {
  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
    },
    onSubmit: async ({ value }) => {
      await api.submit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField
        name="name"
        validators={{
          onChange: ({ value }) => (!value ? 'Name is required' : undefined),
        }}
      >
        {(field) => <field.TextField label="Name" placeholder="Enter your name" />}
      </form.AppField>

      <form.AppField
        name="email"
        validators={{
          onChange: ({ value }) => {
            if (!value) return 'Email is required';
            if (!value.includes('@')) return 'Invalid email';
            return undefined;
          },
        }}
      >
        {(field) => <field.TextField label="Email" type="email" placeholder="you@example.com" />}
      </form.AppField>

      <form.AppForm>{(form) => <form.SubmitButton label="Submit" />}</form.AppForm>
    </form>
  );
}
```

### Counter UI Example

From the actual implementation:

```tsx
const form = useAppForm({
  defaultValues: {
    value: '',
  },
  onSubmit: async ({ value }) => {
    const bigIntValue = BigInt(value.value);
    await incrementBy({ args: [bigIntValue] });
    form.reset();
  },
});

return (
  <form onSubmit={(e) => {
    e.preventDefault();
    handleIncrementBy();
  }}>
    <form.AppField
      name="value"
      validators={{
        onChange: ({ value }) => {
          if (!value) return 'Value is required';
          if (isNaN(Number(value))) return 'Must be a valid number';
          if (Number(value) <= 0) return 'Value must be greater than 0';
          if (!Number.isInteger(Number(value))) return 'Value must be a whole number';
          return undefined;
        },
      }}
    >
      {(field) => (
        <field.NumberField
          placeholder="Enter value"
          disabled={isSubmitting}
        />
      )}
    </form.AppField>
  </form>
);
```

### Reusable Form Components with `withForm`

Create a reusable form component:

```tsx
import { withForm } from '~/components/form';

import { formOptions } from '@tanstack/react-form';

const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
});

export const PersonForm = withForm({
  ...formOpts,
  props: {
    title: '',
  },
  render: ({ form, title }) => {
    return (
      <div>
        <h2>{title}</h2>
        <form.AppField name="firstName">
          {(field) => <field.TextField label="First Name" />}
        </form.AppField>
        <form.AppField name="lastName">
          {(field) => <field.TextField label="Last Name" />}
        </form.AppField>
        <form.AppForm>{(form) => <form.SubmitButton />}</form.AppForm>
      </div>
    );
  },
});

// Usage
function ParentComponent() {
  const form = useAppForm({ ...formOpts });
  return <PersonForm form={form} title="Enter Your Name" />;
}
```

## Benefits

### 1. Reduced Verbosity

**Before (without composition):**

```tsx
<form.Field name="email">
  {(field) => (
    <div className="space-y-1">
      <label>Email</label>
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
      />
      {field.state.meta.errors.length > 0 && (
        <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
      )}
    </div>
  )}
</form.Field>
```

**After (with composition):**

```tsx
<form.AppField name="email">{(field) => <field.TextField label="Email" />}</form.AppField>
```

### 2. Type Safety

All components are fully typed and provide IntelliSense support:

```tsx
// TypeScript knows the exact shape of the form
const form = useAppForm({
  defaultValues: {
    email: '', // string
    age: 0, // number
  },
});

// Autocomplete for field names
<form.AppField name="email" /> // ✅
<form.AppField name="invalid" /> // ❌ TypeScript error
```

### 3. Consistency

All forms use the same components with consistent:

- Error handling
- Styling
- Validation patterns
- Loading states

### 4. Reusability

Field components can be reused across the entire application:

```tsx
// In form A
<field.TextField label="Name" />

// In form B
<field.TextField label="Username" />

// In form C
<field.NumberField label="Age" />
```

### 5. Easy Testing

Components can be tested in isolation:

```tsx
import { TextField } from '~/components/form';

test('TextField shows error', () => {
  // Test the component independently
});
```

## Creating Custom Field Components

### Step 1: Create the Component

```tsx
// app/components/form/fields/email-field.tsx
import { Input } from '~/components/ui/input';

import { useFieldContext } from '../form-context';

export function EmailField({ label = 'Email' }: { label?: string }) {
  const field = useFieldContext<string>();

  return (
    <div className="space-y-1">
      <label>{label}</label>
      <Input
        type="email"
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
      />
      {field.state.meta.errors.length > 0 && (
        <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
      )}
    </div>
  );
}
```

### Step 2: Register in Custom Hook

```tsx
// app/components/form/use-app-form.ts
import { EmailField } from './fields/email-field';

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    EmailField, // Add your new component
  },
  formComponents: {
    SubmitButton,
  },
});
```

### Step 3: Export

```tsx
// app/components/form/index.ts
export { EmailField } from './fields/email-field';
```

### Step 4: Use

```tsx
<form.AppField name="email">{(field) => <field.EmailField />}</form.AppField>
```

## Advanced Patterns

### Grouped Fields

Create reusable field groups:

```tsx
function AddressFields() {
  return (
    <>
      <form.AppField name="street">{(field) => <field.TextField label="Street" />}</form.AppField>
      <form.AppField name="city">{(field) => <field.TextField label="City" />}</form.AppField>
      <form.AppField name="zipCode">
        {(field) => <field.TextField label="ZIP Code" />}
      </form.AppField>
    </>
  );
}

// Usage
function MyForm() {
  return (
    <form>
      <AddressFields />
    </form>
  );
}
```

### Conditional Fields

Show/hide fields based on form state:

```tsx
<form.Subscribe selector={(state) => state.values.userType}>
  {(userType) =>
    userType === 'company' ? (
      <form.AppField name="companyName">
        {(field) => <field.TextField label="Company Name" />}
      </form.AppField>
    ) : null
  }
</form.Subscribe>
```

### Custom Validators

Create reusable validators:

```tsx
const validators = {
  required: (message = 'This field is required') => ({
    onChange: ({ value }: { value: any }) => (!value ? message : undefined),
  }),
  email: () => ({
    onChange: ({ value }: { value: string }) => {
      if (!value) return 'Email is required';
      if (!value.includes('@')) return 'Invalid email address';
      return undefined;
    },
  }),
  minLength: (min: number) => ({
    onChange: ({ value }: { value: string }) =>
      value.length < min ? `Must be at least ${min} characters` : undefined,
  }),
};

// Usage
<form.AppField name="email" validators={validators.email()}>
  {(field) => <field.TextField label="Email" />}
</form.AppField>;
```

## Performance Optimization

### Tree-Shaking

For large applications with many field components, use lazy loading:

```tsx
import { lazy } from 'react';

const TextField = lazy(() => import('./fields/text-field'));
const NumberField = lazy(() => import('./fields/number-field'));

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
  },
});

// In your app
<Suspense fallback={<Spinner />}>
  <MyForm />
</Suspense>;
```

## Best Practices

1. **Keep field components simple** - Focus on rendering and basic state management
2. **Use validators prop** - Define validation at the field level
3. **Leverage TypeScript** - Get full type safety and autocomplete
4. **Create reusable validators** - Don't repeat validation logic
5. **Group related fields** - Create composite field components
6. **Test components independently** - Test field components in isolation
7. **Document custom components** - Add JSDoc comments for your team

## Migration Guide

### From Basic TanStack Form

**Before:**

```tsx
import { useForm } from '@tanstack/react-form';

const form = useForm({
  defaultValues: { name: '' },
});

<form.Field name="name">
  {(field) => (
    <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
  )}
</form.Field>;
```

**After:**

```tsx
import { useAppForm } from '~/components/form';

const form = useAppForm({
  defaultValues: { name: '' },
});

<form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>;
```

## Troubleshooting

### Issue: "useFieldContext must be used within a field context"

**Cause:** Using field components outside of `form.AppField`.

**Solution:** Wrap your field component in `form.AppField`:

```tsx
// ❌ Wrong
<field.TextField label="Name" />

// ✅ Correct
<form.AppField name="name">
  {(field) => <field.TextField label="Name" />}
</form.AppField>
```

### Issue: TypeScript errors with field names

**Cause:** Type mismatch between form definition and field usage.

**Solution:** Ensure field names match defaultValues:

```tsx
const form = useAppForm({
  defaultValues: {
    email: '', // ✅ Defined here
  },
});

<form.AppField name="email" /> // ✅ Matches
<form.AppField name="name" />  // ❌ Not defined
```

## Related Documentation

- [Form Validation](./FORM_VALIDATION.md)
- [Optimistic Mutations](./OPTIMISTIC_MUTATIONS.md)
- [TanStack Form Composition Guide](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)

## Resources

- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [Form Composition Guide](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)
- [Creating Custom Field Components](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition#pre-bound-field-components)
