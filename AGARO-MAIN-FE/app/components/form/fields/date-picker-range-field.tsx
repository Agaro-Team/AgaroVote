/**
 * DatePickerRangeField Component
 *
 * A reusable date range picker field component that uses TanStack Form's field context
 * combined with shadcn Field primitives for enhanced accessibility and styling.
 */
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from '~/components/ui/date-range-picker';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';

import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../form-context';

interface DatePickerRangeFieldProps {
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
  variant?: React.ComponentProps<typeof DateRangePicker>['variant'];
  /**
   * Number of months to display
   * @default 2
   */
  numberOfMonths?: number;
  /**
   * Additional props for the DateRangePicker component
   */
  dateRangePickerProps?: Omit<
    React.ComponentProps<typeof DateRangePicker>,
    'value' | 'onChange' | 'disabled' | 'fromDate' | 'toDate'
  >;
}

export function DatePickerRangeField({
  label,
  description,
  placeholder = 'Pick a date range',
  dateFormat = 'LLL dd, y',
  disabled = false,
  className,
  fromDate,
  toDate,
  orientation = 'vertical',
  buttonWidth = 'w-full',
  showIcon = true,
  variant = 'outline',
  numberOfMonths = 2,
  dateRangePickerProps,
}: DatePickerRangeFieldProps) {
  const field = useFieldContext<DateRange | undefined>();

  const errors = useStore(field.store, (state) =>
    state.meta.errors.map((error) => ({ message: error.message }))
  );
  const hasError = useStore(field.store, (state) => state.meta.isTouched && !state.meta.isValid);

  return (
    <Field orientation={orientation} data-invalid={hasError}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <DateRangePicker
        value={field.state.value}
        onChange={(range) => field.handleChange(range)}
        placeholder={placeholder}
        dateFormat={dateFormat}
        disabled={disabled}
        fromDate={fromDate}
        toDate={toDate}
        buttonWidth={buttonWidth}
        showIcon={showIcon}
        variant={variant}
        numberOfMonths={numberOfMonths}
        className={className}
        {...dateRangePickerProps}
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
