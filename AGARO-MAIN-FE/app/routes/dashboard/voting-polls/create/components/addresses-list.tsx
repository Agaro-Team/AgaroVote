/**
 * AddressesList Component
 *
 * Renders the list of addresses with automatic virtualization for large datasets.
 * Extracted as a separate component to properly use React hooks.
 *
 * Features:
 * - Exposes scrollToTop and scrollToBottom methods via ref for programmatic scrolling
 * - Supports both normal grid view and virtualized scrolling
 * - Automatically switches between views based on dataset size
 * - Tracks first and last fields for smooth scrolling in normal mode
 */
import { Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Field, FieldError } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import type { AnyFieldApi } from '@tanstack/react-form';
import { useVirtualizer } from '@tanstack/react-virtual';

interface AddressesListProps {
  field: AnyFieldApi;
  formField: any; // TanStack Form field component
  onViewModeChange?: (mode: 'normal' | 'virtual') => void;
}

export interface AddressesListRef {
  scrollToTop: () => void;
  scrollToBottom: () => void;
}

// Threshold for switching to virtual mode
const VIRTUAL_MODE_THRESHOLD = 50;

export const AddressesList = forwardRef<AddressesListRef, AddressesListProps>(
  ({ field, formField: FormField, onViewModeChange }, ref) => {
    const [viewMode, setViewMode] = useState<'normal' | 'virtual'>('normal');
    const parentRef = useRef<HTMLDivElement>(null);
    const firstFieldRef = useRef<HTMLDivElement>(null);
    const lastFieldRef = useRef<HTMLDivElement>(null);

    const addressCount = field.state.value.length;
    const isLargeDataset = addressCount > VIRTUAL_MODE_THRESHOLD;
    const shouldUseVirtual = isLargeDataset && viewMode === 'virtual';

    // Auto-switch to virtual mode for large datasets
    useEffect(() => {
      if (isLargeDataset && viewMode === 'normal') {
        setViewMode('virtual');
        onViewModeChange?.('virtual');
      } else if (!isLargeDataset && viewMode === 'virtual') {
        setViewMode('normal');
        onViewModeChange?.('normal');
      }
    }, [isLargeDataset, viewMode, onViewModeChange]);

    // Setup virtualizer for large datasets
    const virtualizer = useVirtualizer({
      count: addressCount,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 60, // Estimated height of each row
      overscan: 5,
      enabled: shouldUseVirtual,
    });

    // Expose scroll methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        scrollToTop: () => {
          if (shouldUseVirtual && parentRef.current) {
            // For virtualized mode, scroll to the first item
            virtualizer.scrollToIndex(0, {
              align: 'start',
              behavior: 'smooth',
            });
          } else if (firstFieldRef.current) {
            // For normal mode, scroll the first field into view
            firstFieldRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        },
        scrollToBottom: () => {
          if (shouldUseVirtual && parentRef.current) {
            // For virtualized mode, scroll to the last item
            virtualizer.scrollToIndex(addressCount - 1, {
              align: 'end',
              behavior: 'smooth',
            });
          } else if (lastFieldRef.current) {
            // For normal mode, scroll the last field into view
            lastFieldRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        },
      }),
      [shouldUseVirtual, virtualizer, addressCount]
    );

    // Render address input field
    const renderAddressField = (index: number, isFirst = false, isLast = false) => {
      return (
        <FormField
          key={index}
          name={`allowedAddresses[${index}]`}
          children={(subField: any) => {
            const hasError =
              subField.state.meta.isTouched &&
              !subField.state.meta.isValid &&
              subField.state.meta.errors.length > 0;
            const errorMessage = subField.state.meta.errors?.[index]?.message;

            return (
              <div
                className="flex gap-2 items-start"
                ref={isFirst ? firstFieldRef : isLast ? lastFieldRef : null}
              >
                {shouldUseVirtual && (
                  <span className="text-xs text-muted-foreground pt-2 w-12 shrink-0">
                    #{index + 1}
                  </span>
                )}
                <Field className="flex-1">
                  <div className="relative">
                    <Input
                      id={`allowedAddresses.${index}`}
                      name={`allowedAddresses.${index}`}
                      value={subField.state.value}
                      onChange={(e) => subField.handleChange(() => e.target.value)}
                      onBlur={subField.handleBlur}
                      aria-invalid={hasError}
                      placeholder="0x..."
                      className="font-mono text-sm"
                    />
                  </div>
                  {hasError && <FieldError className="text-xs mt-1">{errorMessage}</FieldError>}
                </Field>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => field.removeValue(index)}
                  aria-label={`Remove address ${index + 1}`}
                  className="shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          }}
        />
      );
    };

    if (addressCount === 0) {
      return (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No addresses added yet. Click "Add Address" or "Upload CSV" to get started.
          </p>
        </div>
      );
    }

    if (shouldUseVirtual) {
      // Virtual scrolling for large datasets
      return (
        <div
          ref={parentRef}
          className="border rounded-lg"
          style={{
            height: '500px',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const index = virtualItem.index;
              return (
                <div
                  key={virtualItem.key}
                  data-index={index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="px-4 py-2"
                >
                  {renderAddressField(index)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Normal grid for small datasets
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {field.state.value.map((_: string, index: number) =>
          renderAddressField(index, index === 0, index === addressCount - 1)
        )}
      </div>
    );
  }
);

AddressesList.displayName = 'AddressesList';
