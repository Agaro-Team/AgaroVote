/**
 * NumberField Component
 *
 * A reusable number input field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../form-context';

interface NumberFieldProps extends React.ComponentProps<'input'> {
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
  formatValue?: (value: string) => string;
  formatValueOnChange?: (value: string) => string;
}

export function NumberField({
  label,
  placeholder,
  description,
  disabled = false,
  className,
  min,
  max,
  step,
  orientation = 'vertical',
  formatValue,
  formatValueOnChange,
  ...props
}: NumberFieldProps) {
  const field = useFieldContext<string>();
  const { errors, hasError } = useStore(field.store, (state) => ({
    errors: state.meta.errors.map((error) => ({ message: error.message })),
    hasError: state.meta.isTouched && !state.meta.isValid && state.meta.errors.length > 0,
  }));

  return (
    <Field orientation={orientation} data-invalid={hasError}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        id={field.name}
        type="text"
        name={field.name}
        value={formatValue ? formatValue(field.state.value) : field.state.value}
        onChange={(e) =>
          field.handleChange(
            formatValueOnChange ? formatValueOnChange(e.target.value) : e.target.value
          )
        }
        onBlur={field.handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
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
