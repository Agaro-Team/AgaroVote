/**
 * SwitchField Component
 *
 * A reusable switch/toggle field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Switch } from '~/components/ui/switch';

import { useFieldContext } from '../form-context';

interface SwitchFieldProps {
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
  /**
   * Additional props for the Switch component
   */
  switchProps?: Omit<
    React.ComponentProps<typeof Switch>,
    'checked' | 'onCheckedChange' | 'disabled'
  >;
}

export function SwitchField({
  label,
  description,
  disabled = false,
  className,
  orientation = 'horizontal',
  switchProps,
}: SwitchFieldProps) {
  const field = useFieldContext<boolean>();
  const hasError = field.state.meta.errors.length > 0;

  return (
    <Field orientation={orientation} data-invalid={hasError} className={className}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Switch
        id={field.name}
        name={field.name}
        checked={field.state.value ?? false}
        onCheckedChange={(checked) => field.handleChange(checked)}
        onBlur={field.handleBlur}
        disabled={disabled}
        aria-invalid={hasError}
        {...switchProps}
      />
      {description && !hasError && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors.map((error) => ({ message: error }))} />
    </Field>
  );
}
