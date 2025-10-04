/**
 * Form Context
 *
 * This file creates the form and field contexts for TanStack Form composition.
 * These contexts enable reusable form components across the application.
 *
 * @see https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
 */
import { createFormHookContexts } from '@tanstack/react-form';

/**
 * Create form and field contexts for the application.
 * Export these to use in custom form components.
 */
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();
