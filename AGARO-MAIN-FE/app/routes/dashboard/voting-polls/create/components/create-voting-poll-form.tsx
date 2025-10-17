/**
 * Create Voting Poll Form Component
 *
 * A complete form for creating new voting polls with validation,
 * smart contract integration, and user feedback.
 */
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import z from 'zod';
import { useAppForm } from '~/components/form/use-app-form';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { parseWagmiErrorForToast } from '~/lib/web3/error-parser';

import { useEffect, useState } from 'react';

import { useCreatePoll } from '../hooks/use-create-poll';
import { AllowedAddressesField } from './allowed-addresses-field';
import { ChoicesArrayField } from './choices-array-field';
import { ShareVotingPollModal } from './share-voting-poll-modal';
import { TransactionProgressDialog } from './transaction-progress';
import { votingPollFormOptions } from './voting-poll-form-options';

type ProgressStep = 'idle' | 'saving' | 'wallet' | 'confirming' | 'verifying' | 'success' | 'error';

export function CreateVotingPollForm() {
  const navigate = useNavigate();
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const {
    createPoll,
    isPending,
    isConfirming,
    isVerifying,
    verificationError,
    error,
    shouldRedirect,
    onChainHash,
    offChainHash,
    storePollData,
  } = useCreatePoll();

  const form = useAppForm({
    ...votingPollFormOptions,
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

        // Validate voting period
        if (!value.votingPeriod?.from || !value.votingPeriod?.to) {
          toast.error('Please select both start and end dates for the voting period');
          return;
        }

        // Create the pool with all required data
        // Note: Smart contract still uses "candidates" terminology
        await createPoll({
          title: value.title,
          description: value.description,
          candidates: validChoices, // Map "choices" to "candidates" for contract
          candidatesTotal: validChoices.length,
          startDate: value.votingPeriod.from,
          endDate: value.votingPeriod.to,
          isPrivate: value.isPrivate,
          allowedAddresses: value.allowedAddresses.filter((addr) => addr.trim() !== ''),
          rewardShare: value.rewardShare,
          isTokenRequired: value.isTokenRequired,
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

  // Handle successful hash verification and show share modal
  useEffect(() => {
    if (shouldRedirect && onChainHash && offChainHash) {
      setProgressStep('success');

      toast.success('Voting Pool Created Successfully!', {
        description: 'Hashes verified. On-chain and off-chain data match perfectly.',
        duration: 5000,
      });

      // Close transaction dialog and open share modal after a short delay
      const timeout = setTimeout(() => {
        setOpenConfirmationDialog(false);
        setProgressStep('idle');
        setOpenShareModal(true);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [shouldRedirect, onChainHash, offChainHash]);

  // Handle error
  useEffect(() => {
    if (error) {
      setProgressStep('error');
      // Close dialog after error
      setTimeout(() => {
        setOpenConfirmationDialog(false);
        setProgressStep('idle');
      }, 3000);
    }
  }, [error]);

  const isSubmitting = isPending || isConfirming || isVerifying;

  return (
    <div className="space-y-6">
      <form.AppForm>
        <form
          id="create-voting-poll-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-8">
            {/* Section 1: Basic Information */}
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide essential details about your voting pool
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
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
                </div>
              </div>
            </Card>

            {/* Section 2: Voting Options */}
            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight">Voting Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Define the choices that voters can select from
                  </p>
                </div>

                <ChoicesArrayField form={form} />
              </div>
            </Card>

            {/* Section 3: Pool Settings */}
            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight">Pool Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure the voting pool parameters and rewards
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {/* Voting Period Field */}
                  <div className="col-span-1 sm:col-span-2">
                    <form.AppField
                      name="votingPeriod"
                      children={(field) => (
                        <field.DatePickerRangeField
                          label="Voting Period"
                          placeholder="Select voting start and end dates"
                          description="Choose when voting starts and when it ends"
                          disabled={isSubmitting}
                          fromDate={new Date()} // Can't select past dates
                          numberOfMonths={2}
                        />
                      )}
                    />
                  </div>

                  {/* Reward Share Field */}
                  <div className="col-span-1">
                    <form.AppField name="rewardShare">
                      {(field) => (
                        <field.NumberField
                          label="Reward Share"
                          placeholder="0"
                          description="Enter the reward share amount"
                          formatValue={(value) => {
                            // Format for display: add thousand separators
                            if (!value || value === '') return '';
                            const numValue = Number(value);
                            if (isNaN(numValue)) return value;
                            return Intl.NumberFormat('en-US').format(numValue);
                          }}
                          formatValueOnChange={(value) => {
                            // Remove all non-numeric characters except decimals for storage
                            const cleaned = value.replace(/[^\d.]/g, '');
                            // Prevent multiple decimal points
                            const parts = cleaned.split('.');
                            if (parts.length > 2) {
                              return parts[0] + '.' + parts.slice(1).join('');
                            }
                            return cleaned;
                          }}
                          disabled={isSubmitting}
                        />
                      )}
                    </form.AppField>
                  </div>

                  {/* Private Pool Switch */}
                  <div className="col-span-1">
                    <form.AppField
                      name="isPrivate"
                      children={(field) => (
                        <field.SwitchField
                          label="Private Pool"
                          orientation="vertical"
                          description="Restrict pool visibility and access"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>

                  {/* Require Token */}
                  <div className="col-span-1">
                    <form.AppField
                      name="isTokenRequired"
                      children={(field) => (
                        <field.SwitchField
                          label="Token Required"
                          orientation="vertical"
                          description="Require voters to commit a token to vote"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 4: Access Control */}

            <Card className="p-6 border-l-4 border-l-amber-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight">Access Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage who can participate in this private voting pool
                  </p>
                </div>

                <AllowedAddressesField form={form} />
              </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-6 bg-muted/50">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <form.SubmitButton
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setOpenConfirmationDialog(true)}
                    className="w-full sm:flex-1"
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
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Transaction Status */}
                {(isConfirming || isVerifying) && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    {isConfirming && 'Waiting for transaction confirmation...'}
                    {isVerifying && 'Waiting for blockchain event to verify hash...'}
                  </div>
                )}
              </div>
            </Card>
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

        {/* Share Modal - Shows after successful creation */}
        {onChainHash && (
          <ShareVotingPollModal
            open={openShareModal}
            onOpenChange={setOpenShareModal}
            id={storePollData?.data?.id ?? ''}
            onClose={() => {
              form.reset();
              navigate('/dashboard/voting-polls');
            }}
          />
        )}
      </form.AppForm>
    </div>
  );
}
