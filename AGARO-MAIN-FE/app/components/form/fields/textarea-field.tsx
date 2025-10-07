/**
 * TextareaField Component
 *
 * A reusable textarea field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Textarea } from '~/components/ui/textarea';

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
  const hasError = field.state.meta.errors.length > 0;

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
      <FieldError errors={field.state.meta.errors.map((error) => ({ message: error }))} />
    </Field>
  );
}
