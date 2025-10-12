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
import { AllowedAddressesField } from './allowed-addresses-field';
import { ChoicesArrayField } from './choices-array-field';
import { TransactionProgressDialog } from './transaction-progress';
import { votingPoolFormOptions } from './voting-pool-form-options';

type ProgressStep = 'idle' | 'saving' | 'wallet' | 'confirming' | 'verifying' | 'success' | 'error';

export function CreateVotingPoolForm() {
  const navigate = useNavigate();
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const {
    createPool,
    isPending,
    isConfirming,
    isVerifying,
    verificationError,
    error,
    shouldRedirect,
    onChainHash,
    offChainHash,
  } = useCreateVotingPool();

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
    } else if (isVerifying && progressStep === 'confirming') {
      setProgressStep('verifying');
    }
  }, [isPending, isConfirming, isVerifying, progressStep]);

  // Handle verification error
  useEffect(() => {
    if (verificationError) {
      setProgressStep('error');

      toast.error('Hash Verification Failed', {
        description: verificationError,
        duration: 10000,
      });

      // Close dialog after error
      setTimeout(() => {
        setOpenConfirmationDialog(false);
        setProgressStep('idle');
      }, 5000);
    }
  }, [verificationError]);

  // Handle successful hash verification and redirect
  useEffect(() => {
    if (shouldRedirect && onChainHash && offChainHash) {
      setProgressStep('success');

      toast.success('Voting Pool Created Successfully!', {
        description: 'Hashes verified. On-chain and off-chain data match perfectly.',
        duration: 5000,
      });

      // Close dialog, reset form, and redirect after a short delay
      const timeout = setTimeout(() => {
        setOpenConfirmationDialog(false);
        setProgressStep('idle');
        form.reset();
        navigate('/dashboard/voting-pools');
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [shouldRedirect, onChainHash, offChainHash, navigate, form]);

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

  const isSubmitting = isPending || isConfirming || isVerifying;

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
                  orientation="vertical"
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
                  ? isVerifying
                    ? 'Verifying Hash...'
                    : isConfirming
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
            {isVerifying && (
              <div className="text-sm text-muted-foreground">
                Waiting for blockchain event to verify hash...
              </div>
            )}
          </div>
        </form>

        <TransactionProgressDialog
          open={openConfirmationDialog}
          onOpenChange={setOpenConfirmationDialog}
          progressStep={progressStep}
          isSubmitting={isSubmitting}
          offChainHash={offChainHash}
          onChainHash={onChainHash}
          verificationError={verificationError}
          error={error}
          onClose={() => setProgressStep('idle')}
          onConfirm={() => form.handleSubmit()}
        />
      </form.AppForm>
    </Card>
  );
}
