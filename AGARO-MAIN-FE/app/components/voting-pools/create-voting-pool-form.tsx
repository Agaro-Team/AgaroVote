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

import { useEffect } from 'react';

import { AllowedAddressesField } from './allowed-addresses-field';
import { ChoicesArrayField } from './choices-array-field';
import { votingPoolFormOptions } from './voting-pool-form-options';

export function CreateVotingPoolForm() {
  const navigate = useNavigate();
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

      // Validate addresses for private pools
      let validAddresses: string[] = [];
      if (value.isPrivate) {
        validAddresses = (value.allowedAddresses || []).filter((addr) => addr.trim() !== '');
        if (validAddresses.length === 0) {
          toast.error('Please add at least 1 valid address for private pool');
          return;
        }
      }

      // Create the pool with all required data
      // Note: Smart contract still uses "candidates" terminology
      createPool({
        title: value.title,
        description: value.description,
        candidates: validChoices, // Map "choices" to "candidates" for contract
        candidatesTotal: validChoices.length,
        expiryDate: value.expiryDate!,
        isPrivate: value.isPrivate,
        allowedAddresses: validAddresses,
      });
    },
  });

  // Handle success
  useEffect(() => {
    if (isSuccess && txHash) {
      toast.success('Voting pool created successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      form.reset();
    }
  }, [isSuccess, txHash]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error('Failed to create voting pool', {
        description: error.message || 'Please try again',
      });
    }
  }, [error]);

  const isSubmitting = isPending || isConfirming;

  return (
    <Card className="p-6">
      <form.AppForm>
        <form
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
                  description="Enable to restrict voting to specific wallet addresses only"
                  disabled={isSubmitting}
                />
              )}
            />

            {/* Allowed Addresses - Only shown when isPrivate is true */}
            <form.Subscribe
              selector={(state) => state.values.isPrivate}
              children={(isEnablePrivate) =>
                isEnablePrivate && <AllowedAddressesField form={form} />
              }
            />

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <form.SubmitButton disabled={isSubmitting}>
                {isSubmitting
                  ? isConfirming
                    ? 'Confirming Transaction...'
                    : 'Creating Pool...'
                  : 'Create Voting Pool'}
              </form.SubmitButton>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Transaction Status */}
            {isConfirming && (
              <div className="text-sm text-muted-foreground">
                Waiting for transaction confirmation...
              </div>
            )}
          </div>
        </form>
      </form.AppForm>
    </Card>
  );
}
