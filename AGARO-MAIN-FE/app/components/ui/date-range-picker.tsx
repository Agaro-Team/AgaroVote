'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn } from '~/lib/utils';

import * as React from 'react';

export interface DateRangePickerProps {
  /**
   * The selected date range value (controlled component)
   */
  value?: DateRange;
  /**
   * Callback when date range changes
   */
  onChange?: (range: DateRange | undefined) => void;
  /**
   * Default date range value (uncontrolled component)
   */
  defaultValue?: DateRange;
  /**
   * Placeholder text when no date range is selected
   */
  placeholder?: string;
  /**
   * Date format string (date-fns format)
   * @default 'LLL dd, y'
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
   * Disable the date range picker
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
   * @default 'w-full'
   */
  buttonWidth?: string;
  /**
   * Show calendar icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Number of months to display
   * @default 2
   */
  numberOfMonths?: number;
  /**
   * Custom calendar props (excluding mode, selected, onSelect which are managed internally)
   */
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect'>;
}

export function DateRangePicker({
  value,
  onChange,
  defaultValue,
  placeholder = 'Pick a date range',
  dateFormat = 'LLL dd, y',
  className,
  popoverClassName,
  variant = 'outline',
  disabled = false,
  fromDate,
  toDate,
  buttonWidth = 'w-full',
  showIcon = true,
  numberOfMonths = 2,
  calendarProps,
}: DateRangePickerProps) {
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>(defaultValue);

  // Determine if component is controlled or uncontrolled
  const isControlled = value !== undefined;
  const selectedRange = isControlled ? value : internalRange;

  const handleRangeChange = (newRange: DateRange | undefined) => {
    if (!isControlled) {
      setInternalRange(newRange);
    }
    onChange?.(newRange);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return placeholder;
    }

    if (!range.to) {
      return format(range.from, dateFormat);
    }

    return `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          disabled={disabled}
          data-empty={!selectedRange?.from}
          className={cn(
            'data-[empty=true]:text-muted-foreground justify-start text-left font-normal',
            buttonWidth,
            className
          )}
        >
          {showIcon && <CalendarIcon />}
          <span className="truncate">{formatDateRange(selectedRange)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto p-0', popoverClassName)} align="start">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={handleRangeChange}
          disabled={disabled}
          fromDate={fromDate}
          toDate={toDate}
          numberOfMonths={numberOfMonths}
          autoFocus
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}
