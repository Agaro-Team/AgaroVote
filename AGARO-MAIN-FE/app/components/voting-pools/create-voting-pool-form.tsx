/**
 * Create Voting Pool Form Component
 *
 * A complete form for creating new voting pools with validation,
 * smart contract integration, and user feedback.
 */
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppForm } from '~/components/form/use-app-form';
import { Card } from '~/components/ui/card';
import { useCreateVotingPool } from '~/hooks/voting-pools/use-create-voting-pool';

import { useEffect, useState } from 'react';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { AllowedAddressesField } from './allowed-addresses-field';
import { ChoicesArrayField } from './choices-array-field';
import { votingPoolFormOptions } from './voting-pool-form-options';

type ProgressStep = 'idle' | 'saving' | 'wallet' | 'confirming' | 'success' | 'error';

export function CreateVotingPoolForm() {
  const navigate = useNavigate();
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const { createPool, isPending, isConfirming, isSuccess, error, txHash } = useCreateVotingPool();

  const form = useAppForm({
    ...votingPoolFormOptions,
    onSubmit: async ({ value }) => {
      // Validate choices
      const validChoices = value.choices.filter((c) => c.trim() !== '');

      if (validChoices.length < 2) {
        toast.error('Please add at least 2 choices with names');
        return;
      }

      try {
        // Step 1: Saving poll data
        setProgressStep('saving');

        // Create the pool with all required data
        // Note: Smart contract still uses "candidates" terminology
        await createPool({
          title: value.title,
          description: value.description,
          candidates: validChoices, // Map "choices" to "candidates" for contract
          candidatesTotal: validChoices.length,
          expiryDate: value.expiryDate!,
          isPrivate: value.isPrivate,
          allowedAddresses: value.allowedAddresses.filter((addr) => addr.trim() !== ''),
        });

        // Step 2: Wallet confirmation will be tracked by isPending/isConfirming
      } catch (err) {
        setProgressStep('error');
        // Error will be handled by useEffect below
      }
    },
  });

  // Track progress based on submission state
  useEffect(() => {
    if (isPending && progressStep === 'saving') {
      setProgressStep('wallet');
    } else if (isConfirming && progressStep === 'wallet') {
      setProgressStep('confirming');
    }
  }, [isPending, isConfirming, progressStep]);

  // Handle success
  useEffect(() => {
    if (isSuccess && txHash) {
      setProgressStep('success');

      toast.success('Voting pool created successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      // Close dialog, reset form, and redirect after a short delay
      setTimeout(() => {
        setOpenConfirmationDialog(false);
        setProgressStep('idle');
        form.reset();
        navigate('/dashboard/voting-pools');
      }, 2000);
    }
  }, [isSuccess, txHash, navigate, form]);

  // Handle error
  useEffect(() => {
    if (error) {
      setProgressStep('error');

      toast.error('Failed to create voting pool', {
        description: error.message || 'Please try again',
      });

      // Close dialog after error
      setTimeout(() => {
        setOpenConfirmationDialog(false);
        setProgressStep('idle');
      }, 3000);
    }
  }, [error]);

  const isSubmitting = isPending || isConfirming;

  return (
    <Card className="p-6">
      <form.AppForm>
        <form
          id="create-voting-pool-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-6">
            {/* Title Field */}
            <form.AppField name="title">
              {(field) => (
                <field.TextField
                  label="Title"
                  placeholder="Enter voting pool title"
                  description="A clear and concise title for your voting pool (max 200 characters)"
                  disabled={isSubmitting}
                />
              )}
            </form.AppField>

            {/* Description Field */}
            <form.AppField name="description">
              {(field) => (
                <field.TextareaField
                  label="Description"
                  placeholder="Describe the purpose and details of this voting pool"
                  description="Provide detailed information about what this vote is for (max 1000 characters)"
                  disabled={isSubmitting}
                  rows={5}
                />
              )}
            </form.AppField>

            {/* Choices Array Field */}
            <ChoicesArrayField form={form} />

            {/* Expiry Date Field */}
            <form.AppField
              name="expiryDate"
              children={(field) => (
                <field.DatePickerField
                  label="Expiry Date"
                  placeholder="Select when voting ends"
                  description="Choose the date and time when voting will close"
                  disabled={isSubmitting}
                  fromDate={new Date()} // Can't select past dates
                />
              )}
            />

            {/* Private Pool Switch */}
            <form.AppField
              name="isPrivate"
              children={(field) => (
                <field.SwitchField
                  label="Private Pool"
                  description="Set to true to restrict visibility"
                  disabled={isSubmitting}
                />
              )}
            />

            {/* Allowed Addresses - Only shown when isPrivate is true */}
            <AllowedAddressesField form={form} />

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <form.SubmitButton
                type="button"
                disabled={isSubmitting}
                onClick={() => setOpenConfirmationDialog(true)}
              >
                {isSubmitting
                  ? isConfirming
                    ? 'Confirming Transaction...'
                    : 'Creating Pool...'
                  : 'Create Voting Pool'}
              </form.SubmitButton>
              <Button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
                variant="outline"
              >
                Cancel
              </Button>
            </div>

            {/* Transaction Status */}
            {isConfirming && (
              <div className="text-sm text-muted-foreground">
                Waiting for transaction confirmation...
              </div>
            )}
          </div>
        </form>

        <Dialog
          open={openConfirmationDialog}
          onOpenChange={(open) => {
            // Only allow closing if not in progress
            if (!isSubmitting || progressStep === 'idle') {
              setOpenConfirmationDialog(open);
              if (!open) setProgressStep('idle');
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {progressStep === 'idle' && 'Confirm Transaction'}
                {progressStep === 'saving' && 'Saving Poll Data...'}
                {progressStep === 'wallet' && 'Wallet Confirmation Required'}
                {progressStep === 'confirming' && 'Confirming Transaction...'}
                {progressStep === 'success' && 'Success!'}
                {progressStep === 'error' && 'Transaction Failed'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Initial confirmation state */}
              {progressStep === 'idle' && (
                <DialogDescription>
                  Are you sure you want to create this voting pool? After confirming, you'll need to
                  approve the transaction in your wallet.
                  <br />
                  <br />
                  <strong>Important:</strong> Please don't close or refresh the page during this
                  process.
                </DialogDescription>
              )}

              {/* Progress steps */}
              {progressStep !== 'idle' && (
                <div className="space-y-3">
                  {/* Step 1: Saving data */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {progressStep === 'saving' ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Saving poll data</p>
                      <p className="text-xs text-muted-foreground">
                        Storing your voting pool information...
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Wallet confirmation */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {progressStep === 'wallet' ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : ['confirming', 'success'].includes(progressStep) ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Wallet confirmation</p>
                      <p className="text-xs text-muted-foreground">
                        {progressStep === 'wallet' ? (
                          <span className="text-primary font-medium">
                            Please confirm the transaction in your wallet extension
                          </span>
                        ) : (
                          'Approve the transaction in your wallet'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Confirming on blockchain */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {progressStep === 'confirming' ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : progressStep === 'success' ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Blockchain confirmation</p>
                      <p className="text-xs text-muted-foreground">
                        {progressStep === 'confirming'
                          ? 'Waiting for transaction to be confirmed...'
                          : 'Transaction will be confirmed on blockchain'}
                      </p>
                    </div>
                  </div>

                  {/* Success message */}
                  {progressStep === 'success' && (
                    <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm text-green-800 dark:text-green-200">
                      Your voting pool has been created successfully! Redirecting to voting pools
                      page...
                    </div>
                  )}

                  {/* Error message */}
                  {progressStep === 'error' && (
                    <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-800 dark:text-red-200">
                      {error?.message || 'Transaction failed. Please try again.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              {progressStep === 'idle' && (
                <>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <form.SubmitButton
                    form="create-voting-pool-form"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Confirm & Proceed
                  </form.SubmitButton>
                </>
              )}

              {progressStep === 'error' && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setOpenConfirmationDialog(false);
                    setProgressStep('idle');
                  }}
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form.AppForm>
    </Card>
  );
}
