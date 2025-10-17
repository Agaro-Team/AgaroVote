/**
 * TextareaField Component
 *
 * A reusable textarea field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Textarea } from '~/components/ui/textarea';

import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../form-context';

interface TextareaFieldProps extends React.ComponentProps<'textarea'> {
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
}

export function TextareaField({
  label,
  placeholder,
  description,
  disabled = false,
  className,
  orientation = 'vertical',
  ...props
}: TextareaFieldProps) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) =>
    state.meta.errors.map((error) => ({ message: error.message }))
  );
  const hasError = useStore(
    field.store,
    (state) => state.meta.isTouched && !state.meta.isValid && state.meta.errors.length > 0
  );

  return (
    <Field orientation={orientation} data-invalid={hasError}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError}
        className={className}
        {...props}
      />
      {description && !hasError && <FieldDescription>{description}</FieldDescription>}
      {hasError && (
        <div className="flex flex-col gap-1">
          {errors.map((error, index) => (
            <FieldError key={index}>{error.message}</FieldError>
          ))}
        </div>
      )}
    </Field>
  );
}
