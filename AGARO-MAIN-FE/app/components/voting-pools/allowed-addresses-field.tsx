/**
 * AllowedAddressesField Component
 *
 * A dynamic array field for managing allowed wallet addresses in private voting pools.
 * Allows adding/removing addresses with validation.
 * Uses TanStack Form's field context to avoid props drilling.
 */
import { Plus, Trash2 } from 'lucide-react';
import { useFieldContext } from '~/components/form/form-context';
import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import * as React from 'react';

interface AllowedAddressesFieldProps {
  disabled?: boolean;
  description?: string;
  className?: string;
}

export function AllowedAddressesField({
  disabled = false,
  description = 'Add wallet addresses that are allowed to vote in this private pool. All addresses will be hashed off-chain to minimize gas fees.',
  className,
}: AllowedAddressesFieldProps) {
  const field = useFieldContext<string[]>();
  const addresses = field.state.value || [];
  const hasError = field.state.meta.errors.length > 0;
  const handleAddAddress = () => {
    field.handleChange([...addresses, '']);
  };

  const handleRemoveAddress = (index: number) => {
    if (addresses.length <= 1) return; // Minimum 1 address required for private pools
    const newAddresses = addresses.filter((_, i) => i !== index);
    field.handleChange(newAddresses);
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    field.handleChange(newAddresses);
  };

  return (
    <Field data-invalid={hasError} className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor={field.name}>
            Allowed Addresses{' '}
            <span className="text-muted-foreground">({addresses.length} total)</span>
          </FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddAddress}
            className="gap-2"
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </div>

        <div className="space-y-3">
          {addresses.map((address, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <label
                    htmlFor={`${field.name}-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Address {index + 1}
                  </label>
                </div>
                <Input
                  id={`${field.name}-${index}`}
                  value={address}
                  onChange={(e) => handleAddressChange(index, e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="0x..."
                  aria-invalid={hasError}
                  disabled={disabled}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveAddress(index)}
                disabled={addresses.length <= 1 || disabled}
                className="mt-7"
                aria-label={`Remove address ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {description && !hasError && <FieldDescription>{description}</FieldDescription>}
        <FieldError errors={field.state.meta.errors.map((error) => ({ message: error }))} />
      </div>
    </Field>
  );
}
