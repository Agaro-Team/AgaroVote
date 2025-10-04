/**
 * Form Components and Hooks
 *
 * This module exports the custom form hook and all reusable form components.
 * Use these throughout the application for consistent form behavior.
 */

// Main form hook
export { useAppForm, withForm, useFieldContext, useFormContext } from './use-app-form';

// Field components (TanStack Form + shadcn Field)
export { TextField } from './fields/text-field';
export { NumberField } from './fields/number-field';

// Form components
export { SubmitButton } from './components/submit-button';

// shadcn Field primitives (for advanced custom fields)
export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '~/components/ui/field';

// Contexts (for advanced use cases)
export { fieldContext, formContext } from './form-context';
