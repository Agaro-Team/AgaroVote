/**
 * AllowedAddressesField Component
 *
 * A dynamic array field for managing allowed wallet addresses in private voting pools.
 * Allows adding/removing addresses with validation.
 * Supports bulk CSV upload for adding multiple addresses at once.
 * Uses TanStack Form's field context to avoid props drilling.
 */
import { Plus, Trash2, Upload } from 'lucide-react';
import { withForm } from '~/components/form';
import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import { useState } from 'react';

import { CSVUploadModal } from './csv-upload-modal';
import { votingPollFormOptions } from './voting-poll-form-options';

export const AllowedAddressesField = withForm({
  ...votingPollFormOptions,
  render: ({ form }) => {
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

    return (
      <form.AppField
        name="allowedAddresses"
        mode="array"
        children={(field) => {
          const hasError =
            (field.state.meta.isTouched &&
              !field.state.meta.isValid &&
              field.state.meta.errors.length) ||
            false;

          // Handler for CSV upload
          const handleCSVUpload = (addresses: string[]) => {
            // Append new addresses to existing ones
            addresses.forEach((address) => {
              field.pushValue(address);
            });
          };

          return (
            <Field
              data-invalid={hasError}
              onFocus={() => {
                field.setMeta((prev) => ({
                  ...prev,
                  isTouched: true,
                }));
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>
                    Allowed Addresses{' '}
                    <span className="text-muted-foreground">
                      ({field.state.value.length} total)
                    </span>
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCSVModalOpen(true)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload CSV
                    </Button>
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
                </div>

                <div className="space-y-3">
                  {field.state.value.map((__, index) => (
                    <form.Field
                      key={index}
                      name={`allowedAddresses[${index}]`}
                      children={(subField) => {
                        const hasError =
                          subField.state.meta.isTouched &&
                          !subField.state.meta.isValid &&
                          subField.state.meta.errors.length > 0;
                        const errorMessage = subField.state.meta.errors?.[index]?.message;

                        console.log({ hasError, errorMessage });

                        return (
                          <div className="flex gap-2 items-start">
                            <Field>
                              <Input
                                id={`allowedAddresses.${index}`}
                                name={`allowedAddresses.${index}`}
                                value={subField.state.value}
                                onChange={(e) => subField.handleChange(() => e.target.value)}
                                onBlur={subField.handleBlur}
                                aria-invalid={hasError}
                                placeholder="0x..."
                              />

                              {hasError && <FieldError>{errorMessage}</FieldError>}
                            </Field>

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => field.removeValue(index)}
                              aria-label={`Remove address ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      }}
                    />
                  ))}
                </div>

                {!hasError && (
                  <FieldDescription>
                    Add wallet addresses that are allowed to vote in this private pool. All
                    addresses will be hashed off-chain to minimize gas fees.
                  </FieldDescription>
                )}
                <FieldError
                  errors={field.state.meta.errors.map((error) => ({
                    message: error?.message,
                  }))}
                />
              </div>

              {/* CSV Upload Modal */}
              <CSVUploadModal
                isOpen={isCSVModalOpen}
                onClose={() => setIsCSVModalOpen(false)}
                onUpload={handleCSVUpload}
                existingAddresses={field.state.value}
              />
            </Field>
          );
        }}
      />
    );
  },
});
