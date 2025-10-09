'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/lib/utils';

import * as React from 'react';

export interface DatePickerProps {
  /**
   * The selected date value (controlled component)
   */
  value?: Date;
  /**
   * Callback when date changes
   */
  onChange?: (date: Date | undefined) => void;
  /**
   * Default date value (uncontrolled component)
   */
  defaultValue?: Date;
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string;
  /**
   * Date format string (date-fns format)
   * @default 'PPP'
   */
  dateFormat?: string;
  /**
   * Custom class name for the trigger button
   */
  className?: string;
  /**
   * Custom class name for the popover content
   */
  popoverClassName?: string;
  /**
   * Button variant
   * @default 'outline'
   */
  variant?: React.ComponentProps<typeof Button>['variant'];
  /**
   * Disable the date picker
   */
  disabled?: boolean;
  /**
   * Minimum selectable date
   */
  fromDate?: Date;
  /**
   * Maximum selectable date
   */
  toDate?: Date;
  /**
   * Custom button width
   * @default 'w-[280px]'
   */
  buttonWidth?: string;
  /**
   * Show calendar icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Custom calendar props (excluding mode, selected, onSelect which are managed internally)
   */
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect'>;
}

export function DatePicker({
  value,
  onChange,
  defaultValue,
  placeholder = 'Pick a date',
  dateFormat = 'PPP',
  className,
  popoverClassName,
  variant = 'outline',
  disabled = false,
  fromDate,
  toDate,
  buttonWidth = 'w-[280px]',
  showIcon = true,
  calendarProps,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(defaultValue);

  // Determine if component is controlled or uncontrolled
  const isControlled = value !== undefined;
  const selectedDate = isControlled ? value : internalDate;

  const handleDateChange = (newDate: Date | undefined) => {
    if (!isControlled) {
      setInternalDate(newDate);
    }
    onChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          disabled={disabled}
          data-empty={!selectedDate}
          className={cn(
            'data-[empty=true]:text-muted-foreground justify-start text-left font-normal',
            buttonWidth,
            className
          )}
        >
          {showIcon && <CalendarIcon />}
          {selectedDate ? format(selectedDate, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto p-0', popoverClassName)}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          disabled={disabled}
          fromDate={fromDate}
          toDate={toDate}
          autoFocus
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}
