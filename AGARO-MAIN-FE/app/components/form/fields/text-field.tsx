/**
 * TextField Component
 *
 * A reusable text input field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../form-context';

interface TextFieldProps extends React.ComponentProps<'input'> {
  label?: string;
  placeholder?: string;
  description?: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'tel';
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
}

export function TextField({
  label,
  placeholder,
  description,
  type = 'text',
  disabled = false,
  className,
  orientation = 'vertical',
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) =>
    state.meta.errors.map((error) => ({ message: error.message }))
  );
  const hasError = errors.length > 0;

  return (
    <Field orientation={orientation} data-invalid={hasError}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        id={field.name}
        type={type}
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
      <div className="flex flex-col gap-1">
        {errors.map((error, index) => (
          <FieldError key={index}>{error.message}</FieldError>
        ))}
      </div>
    </Field>
  );
}
