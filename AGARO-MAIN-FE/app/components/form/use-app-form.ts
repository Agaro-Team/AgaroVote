/**
 * Custom App Form Hook
 *
 * This hook creates a custom form hook with pre-bound field and form components.
 * It enables a more concise and reusable form API across the application.
 *
 * @see https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
 */
import { createFormHook } from '@tanstack/react-form';

import { SubmitButton } from './components/submit-button';
import { NumberField } from './fields/number-field';
import { TextField } from './fields/text-field';
import { TextareaField } from './fields/textarea-field';
import { fieldContext, formContext } from './form-context';

/**
 * Create a custom form hook with pre-bound components.
 *
 * Usage:
 * ```tsx
 * const form = useAppForm({
 *   defaultValues: { name: '' }
 * });
 *
 * return (
 *   <form.AppField name="name">
 *     {(field) => <field.TextField label="Name" />}
 *   </form.AppField>
 * );
 * ```
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    TextareaField,
  },
  formComponents: {
    SubmitButton,
  },
});

// Re-export contexts for external use
export { useFieldContext, useFormContext } from './form-context';
