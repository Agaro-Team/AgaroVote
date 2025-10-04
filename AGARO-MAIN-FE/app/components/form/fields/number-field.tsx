/**
 * NumberField Component
 *
 * A reusable number input field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

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
  ...props
}: NumberFieldProps) {
  const field = useFieldContext<string>();
  const hasError = field.state.meta.errors.length > 0;

  return (
    <Field orientation={orientation} data-invalid={hasError}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        id={field.name}
        type="text"
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
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
      <FieldError errors={field.state.meta.errors.map((error) => ({ message: error }))} />
    </Field>
  );
}
