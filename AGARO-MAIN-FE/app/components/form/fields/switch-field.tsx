/**
 * SwitchField Component
 *
 * A reusable switch/toggle field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Switch } from '~/components/ui/switch';

import { useStore } from '@tanstack/react-form';

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

  const errors = useStore(field.store, (state) =>
    state.meta.errors.map((error) => ({ message: error.message }))
  );
  const hasError = useStore(field.store, (state) => state.meta.isTouched && !state.meta.isValid);

  return (
    <Field orientation={orientation} data-invalid={hasError} className={className}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <div>
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
      </div>
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
