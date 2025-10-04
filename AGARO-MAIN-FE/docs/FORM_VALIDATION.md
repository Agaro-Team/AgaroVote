# Form Validation with TanStack Form

## Overview

This document describes the implementation of form validation using `@tanstack/react-form` for the Counter UI increment value input, providing a better user experience with real-time validation feedback.

## Dependencies

The following packages are used:

- `@tanstack/react-form` - Form state management and validation
- `zod` - Type-safe schema validation (installed for future use)
- `@tanstack/zod-form-adapter` - Zod adapter for TanStack Form (installed for future use)

## Implementation

### Counter UI Form Validation

The `incrementBy` feature now uses TanStack Form with inline validation for a better user experience.

#### Validation Rules

The input validates the following:

1. **Required** - Value cannot be empty
2. **Valid Number** - Must be a numeric value
3. **Positive** - Must be greater than 0
4. **Whole Number** - Must be an integer (no decimals)
5. **Safe Range** - Must not exceed `Number.MAX_SAFE_INTEGER`

#### Hook Implementation (`use-counter-ui.ts`)

```tsx
import { useForm } from '@tanstack/react-form';

// Inside useCounterUI hook
const form = useForm({
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
      form.reset();
    } catch (error) {
      console.error('Failed to increment by custom value:', error);
    }
  },
});
```

#### Component Implementation (`counter-ui.tsx`)

```tsx
<form
  onSubmit={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleIncrementBy();
  }}
  className="space-y-2"
>
  <form.Field
    name="value"
    validators={{
      onChange: ({ value }) => {
        if (!value) return 'Value is required';
        if (isNaN(Number(value))) return 'Must be a valid number';
        if (Number(value) <= 0) return 'Value must be greater than 0';
        if (!Number.isInteger(Number(value))) return 'Value must be a whole number';
        if (Number(value) > Number.MAX_SAFE_INTEGER) return 'Value is too large';
        return undefined;
      },
    }}
  >
    {(field) => (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Input
              type="text"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Enter value"
              className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
              disabled={isIncrementingBy || isReading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={
              isIncrementingBy ||
              isReading ||
              field.state.meta.errors.length > 0 ||
              !field.state.value
            }
            className="h-10"
          >
            {isIncrementingBy ? <Spinner className="w-4 h-4" /> : 'Add'}
          </Button>
        </div>
      </div>
    )}
  </form.Field>
</form>
```

## User Experience Features

### Real-time Validation

- **onChange validation** - Validates as the user types
- **Error display** - Shows clear error messages below the input
- **Visual feedback** - Red border on input when there's an error
- **Button state** - Submit button is disabled when there are errors

### Error Messages

The form provides clear, user-friendly error messages:

| Condition        | Error Message                  |
| ---------------- | ------------------------------ |
| Empty value      | "Value is required"            |
| Non-numeric      | "Must be a valid number"       |
| Zero or negative | "Value must be greater than 0" |
| Decimal number   | "Value must be a whole number" |
| Too large        | "Value is too large"           |

### Form Reset

The form automatically resets after a successful submission, clearing the input and any error states.

## Benefits

1. **Better UX** - Real-time feedback prevents submission errors
2. **Clear Communication** - Users know exactly what's wrong
3. **Accessibility** - Error messages are properly associated with inputs
4. **Type Safety** - Form state is type-checked
5. **Separation of Concerns** - Validation logic is separated from UI logic
6. **Reusable** - Can be easily extended or reused for other forms

## Future Enhancements

### Using Zod Schema

For more complex validation or reusable schemas, you can use Zod:

```tsx
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-form-adapter';

const incrementBySchema = z.object({
  value: z
    .string()
    .min(1, 'Value is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Must be a valid number',
    })
    .refine((val) => Number(val) > 0, {
      message: 'Value must be greater than 0',
    })
    .refine((val) => Number.isInteger(Number(val)), {
      message: 'Value must be a whole number',
    }),
});

// In form field
<form.Field
  name="value"
  validators={{
    onChange: zodValidator({ schema: incrementBySchema }),
  }}
>
```

### Additional Features

- **onBlur validation** - Validate when user leaves the field
- **Debounced validation** - Reduce validation frequency for expensive checks
- **Async validation** - Validate against backend (e.g., check if value is available)
- **Custom error styling** - More elaborate error UI with icons and animations
- **Field dependencies** - Validate based on other field values

## Best Practices

1. **Keep validation simple** - Only validate what's necessary
2. **Provide clear messages** - Tell users exactly what to fix
3. **Validate on change** - Give immediate feedback
4. **Disable invalid submissions** - Prevent errors before they happen
5. **Reset after success** - Clear form for next interaction
6. **Use proper types** - Leverage TypeScript for type safety

## Testing

### Manual Testing Checklist

- [ ] Empty input shows "Value is required"
- [ ] Letters show "Must be a valid number"
- [ ] Zero shows "Value must be greater than 0"
- [ ] Negative numbers show "Value must be greater than 0"
- [ ] Decimals show "Value must be a whole number"
- [ ] Very large numbers show "Value is too large"
- [ ] Valid number enables submit button
- [ ] Form resets after successful submission
- [ ] Error styling appears on input border
- [ ] Button is disabled during submission

## Related Documentation

- [Optimistic Mutations](./OPTIMISTIC_MUTATIONS.md)
- [Toast Implementation](./TOAST_IMPLEMENTATION.md)
- [Smart Contract Integration](./SMART_CONTRACT_INTEGRATION.md)

## Resources

- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [Zod Documentation](https://zod.dev/)
- [React Hook Form vs TanStack Form](https://tanstack.com/form/latest/docs/overview#why-tanstack-form)
