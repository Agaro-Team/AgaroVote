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
                {/* Header with actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <FieldLabel htmlFor={field.name} className="mb-0">
                    Allowed Addresses{' '}
                    <span className="text-muted-foreground font-normal">
                      ({field.state.value.length} total)
                    </span>
                  </FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCSVModalOpen(true)}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Upload CSV</span>
                      <span className="sm:hidden">CSV</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.pushValue('')}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Address</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>

                {/* Addresses Grid - Responsive layout */}
                {field.state.value.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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

                          return (
                            <div className="flex gap-2 items-start">
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
                                {hasError && (
                                  <FieldError className="text-xs mt-1">{errorMessage}</FieldError>
                                )}
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
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No addresses added yet. Click "Add Address" or "Upload CSV" to get started.
                    </p>
                  </div>
                )}

                {/* Description and Errors */}
                {!hasError && field.state.value.length > 0 && (
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
