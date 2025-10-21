/**
 * AllowedAddressesField Component
 *
 * A dynamic array field for managing allowed wallet addresses in private voting pools.
 * Features:
 * - Add/remove addresses individually with validation
 * - Remove all addresses with confirmation dialog
 * - New addresses appear at the top (first position) with auto-scroll for better UX
 * - Grouped button layout for compact and tidy UI (button group style)
 * - Bulk CSV upload for adding multiple addresses at once
 * - Download addresses as CSV
 * - Maximum limit of 500 total addresses with validation and error feedback
 * - Asynchronous batch processing for large datasets (>100 addresses)
 * - Virtual scrolling for rendering large lists without freezing (uses @tanstack/react-virtual)
 * - Automatic view switching: detailed view for small datasets, virtualized view for large datasets
 * - Browser navigation protection during processing to prevent data loss
 * - Visual feedback for processing state
 * - Uses TanStack Form's field context to avoid props drilling
 */
import { Download, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { withForm } from '~/components/form';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field';

import { useEffect, useRef, useState } from 'react';

import { AddressesList, type AddressesListRef } from './addresses-list';
import { CSVUploadModal } from './csv-upload-modal';
import { votingPollFormOptions } from './voting-poll-form-options';

// Maximum allowed addresses limit
const MAX_ADDRESSES_LIMIT = 500;

export const AllowedAddressesField = withForm({
  ...votingPollFormOptions,
  render: ({ form }) => {
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
    const [isRemoveAllDialogOpen, setIsRemoveAllDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVirtualized, setIsVirtualized] = useState(false);
    const addressesListRef = useRef<AddressesListRef>(null);

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

          // Handler for adding a new address and scrolling to it
          const handleAddAddress = () => {
            // Insert new address at the top (index 0)
            field.insertValue(0, '');
            // Scroll to top after a short delay to allow the DOM to update
            setTimeout(() => {
              addressesListRef.current?.scrollToTop();
            }, 100);
          };

          // Handler for removing all addresses
          const handleRemoveAll = () => {
            const count = field.state.value.length;
            // Remove all addresses by setting empty array
            field.setValue([]);
            setIsRemoveAllDialogOpen(false);
            toast.success('Addresses Cleared', {
              description: `Successfully removed ${count} address${count !== 1 ? 'es' : ''}.`,
            });
          };

          // Handler for CSV upload with async batching for large datasets
          const handleCSVUpload = async (addresses: string[]) => {
            const currentCount = field.state.value.length;
            const newCount = addresses.length;
            const totalCount = currentCount + newCount;

            // Validate total addresses limit
            if (totalCount > MAX_ADDRESSES_LIMIT) {
              toast.error('Address Limit Exceeded', {
                description: `Cannot add ${newCount} addresses. You currently have ${currentCount} addresses, and the maximum limit is ${MAX_ADDRESSES_LIMIT}. You can add up to ${MAX_ADDRESSES_LIMIT - currentCount} more addresses.`,
              });
              setIsCSVModalOpen(false);
              return;
            }

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
                      ({addressCount} / {MAX_ADDRESSES_LIMIT})
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
                    {addressCount >= MAX_ADDRESSES_LIMIT && (
                      <span className="text-destructive font-normal ml-2 text-xs">
                        (Limit reached)
                      </span>
                    )}
                  </FieldLabel>

                  {/* Action Buttons - Grouped for compact UI */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Primary Actions Group */}
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddAddress}
                        disabled={isProcessing || addressCount >= MAX_ADDRESSES_LIMIT}
                        className="rounded-r-none border-r-0 gap-2"
                        title={
                          addressCount >= MAX_ADDRESSES_LIMIT
                            ? 'Maximum address limit reached'
                            : 'Add new address'
                        }
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCSVModalOpen(true)}
                        disabled={isProcessing || addressCount >= MAX_ADDRESSES_LIMIT}
                        className="rounded-none gap-2"
                        title={
                          addressCount >= MAX_ADDRESSES_LIMIT
                            ? 'Maximum address limit reached'
                            : 'Upload CSV file'
                        }
                      >
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Upload</span>
                      </Button>
                      {addressCount > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsRemoveAllDialogOpen(true)}
                          disabled={isProcessing}
                          className="rounded-l-none gap-2 hover:bg-destructive hover:text-destructive-foreground"
                          title="Remove all addresses"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Clear</span>
                        </Button>
                      )}
                    </div>

                    {/* Secondary Actions */}
                    {addressCount > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCSV(field.state.value)}
                        disabled={isProcessing}
                        className="gap-2"
                        title="Download as CSV"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Addresses List - Uses separate component to properly handle hooks */}
                <AddressesList
                  ref={addressesListRef}
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

              {/* Remove All Confirmation Dialog */}
              <Dialog open={isRemoveAllDialogOpen} onOpenChange={setIsRemoveAllDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove All Addresses?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to remove all {addressCount} address
                      {addressCount !== 1 ? 'es' : ''}? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleRemoveAll} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Field>
          );
        }}
      />
    );
  },
});
