/**
 * AllowedAddressesField Component
 *
 * A dynamic array field for managing allowed wallet addresses in private voting pools.
 * Allows adding/removing addresses with validation.
 * Uses TanStack Form's field context to avoid props drilling.
 */
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';

import { withForm } from '../form';
import { Input } from '../ui/input';
import { votingPoolFormOptions } from './voting-pool-form-options';

export const AllowedAddressesField = withForm({
  ...votingPoolFormOptions,
  render: ({ form }) => {
    const hasError = form.state.errors.length || false;
    const addresses = form.state.values.allowedAddresses || [];

    return (
      <form.AppField
        name="allowedAddresses"
        mode="array"
        children={(field) => (
          <Field data-invalid={hasError}>
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
                  onClick={() => field.pushValue('')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Address
                </Button>
              </div>

              <div className="space-y-3">
                {field.state.value.map((__, index) => (
                  <form.Field
                    key={index}
                    name={`allowedAddresses[${index}]`}
                    children={(subField) => (
                      <div className="flex gap-2 items-start">
                        <Field>
                          <Input
                            id={`allowedAddresses.${index}`}
                            name={`allowedAddresses.${index}`}
                            value={subField.state.value}
                            onChange={(e) => subField.handleChange((prev) => e.target.value)}
                            onBlur={subField.handleBlur}
                            aria-invalid={subField.state.meta.errors.length > 0}
                            placeholder="0x..."
                          />

                          <FieldError>{subField.state.meta.errors?.[index]?.message}</FieldError>
                        </Field>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => field.removeValue(index)}
                          disabled={field.state.value.length <= 1}
                          aria-label={`Remove address ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  />
                ))}
              </div>

              {!hasError && (
                <FieldDescription>
                  Add wallet addresses that are allowed to vote in this private pool. All addresses
                  will be hashed off-chain to minimize gas fees.
                </FieldDescription>
              )}
              <FieldError
                errors={field.state.meta.errors.map((error) => ({
                  message: error?.message,
                }))}
              />
            </div>
          </Field>
        )}
      />
    );
  },
});
