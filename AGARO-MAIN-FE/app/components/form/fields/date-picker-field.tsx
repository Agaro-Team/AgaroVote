/**
 * DatePickerField Component
 *
 * A reusable date picker field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import { DatePicker } from '~/components/ui/date-picker';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';

import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../form-context';

interface DatePickerFieldProps {
  label?: string;
  description?: string;
  placeholder?: string;
  dateFormat?: string;
  disabled?: boolean;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
  /**
   * Custom button width
   * @default 'w-full'
   */
  buttonWidth?: string;
  /**
   * Show calendar icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Button variant
   */
  variant?: React.ComponentProps<typeof DatePicker>['variant'];
  /**
   * Additional props for the DatePicker component
   */
  datePickerProps?: Omit<
    React.ComponentProps<typeof DatePicker>,
    'value' | 'onChange' | 'disabled' | 'fromDate' | 'toDate'
  >;
}

export function DatePickerField({
  label,
  description,
  placeholder = 'Pick a date',
  dateFormat = 'PPP',
  disabled = false,
  className,
  fromDate,
  toDate,
  orientation = 'vertical',
  buttonWidth = 'w-full',
  showIcon = true,
  variant = 'outline',
  datePickerProps,
}: DatePickerFieldProps) {
  const field = useFieldContext<Date | undefined>();
  const { errors, hasError } = useStore(field.store, (state) => ({
    errors: state.meta.errors.map((error) => ({ message: error.message })),
    hasError: state.meta.isTouched && !state.meta.isValid && state.meta.errors.length > 0,
  }));

  return (
    <Field orientation={orientation} data-invalid={hasError}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <DatePicker
        value={field.state.value}
        onChange={(date) => field.handleChange(date)}
        placeholder={placeholder}
        dateFormat={dateFormat}
        disabled={disabled}
        fromDate={fromDate}
        toDate={toDate}
        buttonWidth={buttonWidth}
        showIcon={showIcon}
        variant={variant}
        className={className}
        {...datePickerProps}
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
