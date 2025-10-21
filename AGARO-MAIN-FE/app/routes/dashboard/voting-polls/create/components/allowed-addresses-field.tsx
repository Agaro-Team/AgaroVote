/**
 * AllowedAddressesField Component
 *
 * A dynamic array field for managing allowed wallet addresses in private voting pools.
 * Features:
 * - Add/remove addresses individually with validation
 * - Bulk CSV upload for adding multiple addresses at once
 * - Asynchronous batch processing for large datasets (>100 addresses)
 * - Virtual scrolling for rendering large lists without freezing (uses @tanstack/react-virtual)
 * - Automatic view switching: detailed view for small datasets, virtualized view for large datasets
 * - Browser navigation protection during processing to prevent data loss
 * - Visual feedback for processing state
 * - Download addresses as CSV
 * - Uses TanStack Form's field context to avoid props drilling
 */
import { Download, Plus, Upload } from 'lucide-react';
import { withForm } from '~/components/form';
import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';

import { useEffect, useState } from 'react';

import { AddressesList } from './addresses-list';
import { CSVUploadModal } from './csv-upload-modal';
import { votingPollFormOptions } from './voting-poll-form-options';

export const AllowedAddressesField = withForm({
  ...votingPollFormOptions,
  render: ({ form }) => {
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVirtualized, setIsVirtualized] = useState(false);

    // Download addresses as CSV
    const handleDownloadCSV = (addresses: string[]) => {
      const csv = ['Address\n', ...addresses.map((addr) => `${addr}\n`)].join('');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'allowed-addresses.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // Prevent user from leaving page while processing
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isProcessing) {
          e.preventDefault();
          // Chrome requires returnValue to be set
          e.returnValue = '';
          return '';
        }
      };

      if (isProcessing) {
        window.addEventListener('beforeunload', handleBeforeUnload);
      }

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, [isProcessing]);

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

          const addressCount = field.state.value.length;

          // Handler for CSV upload with async batching for large datasets
          const handleCSVUpload = async (addresses: string[]) => {
            const BATCH_SIZE = 100;
            const shouldBatch = addresses.length > BATCH_SIZE;

            if (!shouldBatch) {
              // Small dataset - process synchronously
              addresses.forEach((address) => {
                field.pushValue(address);
              });
              return;
            }

            // Large dataset - process asynchronously in batches
            setIsProcessing(true);
            try {
              for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
                const batch = addresses.slice(i, i + BATCH_SIZE);

                // Process batch
                batch.forEach((address) => {
                  field.pushValue(address);
                });

                // Yield to the main thread to keep UI responsive
                if (i + BATCH_SIZE < addresses.length) {
                  await new Promise((resolve) => setTimeout(resolve, 0));
                }
              }
            } finally {
              setIsProcessing(false);
            }
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
                      ({addressCount} total)
                    </span>
                    {isProcessing && (
                      <span className="text-primary font-normal ml-2 animate-pulse">
                        (Processing...)
                      </span>
                    )}
                    {isVirtualized && (
                      <span className="text-blue-600 dark:text-blue-400 font-normal ml-2 text-xs">
                        (Virtualized for performance)
                      </span>
                    )}
                  </FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {addressCount > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCSV(field.state.value)}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCSVModalOpen(true)}
                      disabled={isProcessing}
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
                      disabled={isProcessing}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Address</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>

                {/* Addresses List - Uses separate component to properly handle hooks */}
                <AddressesList
                  field={field}
                  formField={form.Field}
                  onViewModeChange={(mode) => setIsVirtualized(mode === 'virtual')}
                />

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
