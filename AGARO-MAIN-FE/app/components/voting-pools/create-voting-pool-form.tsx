/**
 * Create Voting Pool Form Component
 *
 * A complete form for creating new voting pools with validation,
 * smart contract integration, and user feedback.
 */
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { isAddress } from 'viem';
import { z } from 'zod';
import { useAppForm } from '~/components/form/use-app-form';
import { Card } from '~/components/ui/card';
import { useCreateVotingPool } from '~/hooks/voting-pools/use-create-voting-pool';

import { useEffect } from 'react';

import { AllowedAddressesField } from './allowed-addresses-field';
import { ChoicesArrayField } from './choices-array-field';

/**
 * Zod Schema for Voting Pool Form Validation
 */
const votingPoolSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or less')
      .refine((val) => val.trim().length > 0, 'Title cannot be empty'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(1000, 'Description must be 1000 characters or less')
      .refine((val) => val.trim().length > 0, 'Description cannot be empty'),
    choices: z
      .array(z.string())
      .min(2, 'At least 2 choices are required')
      .refine(
        (choices) => choices.filter((c) => c.trim() !== '').length >= 2,
        'At least 2 choices must have names'
      )
      .refine((choices) => {
        const nonEmpty = choices.filter((c) => c.trim() !== '');
        const unique = new Set(nonEmpty.map((c) => c.trim().toLowerCase()));
        return unique.size === nonEmpty.length;
      }, 'Choice names must be unique'),
    expiryDate: z
      .date({
        message: 'Expiry date is required',
      })
      .refine((date) => date > new Date(), 'Expiry date must be in the future'),
    isPrivate: z.boolean().default(false),
    allowedAddresses: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // If private, validate allowed addresses
    if (data.isPrivate) {
      if (!data.allowedAddresses || data.allowedAddresses.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'At least 1 address is required for private pools',
          path: ['allowedAddresses'],
        });
        return;
      }

      // Validate each address
      const validAddresses = data.allowedAddresses.filter((addr) => addr.trim() !== '');

      if (validAddresses.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'At least 1 valid address is required for private pools',
          path: ['allowedAddresses'],
        });
        return;
      }

      // Check if all addresses are valid Ethereum addresses
      for (let i = 0; i < validAddresses.length; i++) {
        if (!isAddress(validAddresses[i])) {
          ctx.addIssue({
            code: 'custom',
            message: `Address ${i + 1} is not a valid Ethereum address`,
            path: ['allowedAddresses'],
          });
        }
      }

      // Check for duplicate addresses
      const unique = new Set(validAddresses.map((addr) => addr.toLowerCase()));
      if (unique.size !== validAddresses.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'Addresses must be unique',
          path: ['allowedAddresses'],
        });
      }
    }
  });

type CreateVotingPoolFormData = z.infer<typeof votingPoolSchema>;

export function CreateVotingPoolForm() {
  const navigate = useNavigate();
  const { createPool, isPending, isConfirming, isSuccess, error, txHash } = useCreateVotingPool();

  const form = useAppForm({
    defaultValues: {
      title: '',
      description: '',
      choices: ['', ''], // Start with 2 empty choices
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
      isPrivate: false,
      allowedAddresses: [''], // Start with 1 empty address
    } satisfies CreateVotingPoolFormData,
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
            <form.AppField
              name="title"
              validators={{
                onChange: ({ value }) => {
                  const result = votingPoolSchema.shape.title.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
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
            <form.AppField
              name="description"
              validators={{
                onChange: ({ value }) => {
                  const result = votingPoolSchema.shape.description.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
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
            <form.AppField
              name="choices"
              validators={{
                onChange: ({ value }) => {
                  const result = votingPoolSchema.shape.choices.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <ChoicesArrayField
                  choices={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errors={field.state.meta.errors as string[]}
                />
              )}
            </form.AppField>

            {/* Expiry Date Field */}
            <form.AppField
              name="expiryDate"
              validators={{
                onChange: ({ value }) => {
                  const result = votingPoolSchema.shape.expiryDate.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <field.DatePickerField
                  label="Expiry Date"
                  placeholder="Select when voting ends"
                  description="Choose the date and time when voting will close"
                  disabled={isSubmitting}
                  fromDate={new Date()} // Can't select past dates
                />
              )}
            </form.AppField>

            {/* Private Pool Switch */}
            <form.AppField name="isPrivate">
              {(field) => (
                <field.SwitchField
                  label="Private Pool"
                  description="Enable to restrict voting to specific wallet addresses only"
                  disabled={isSubmitting}
                />
              )}
            </form.AppField>

            {/* Allowed Addresses - Only shown when isPrivate is true */}
            <form.Subscribe selector={(state) => ({ isPrivate: state.values.isPrivate })}>
              {({ isPrivate }) =>
                isPrivate && (
                  <form.AppField
                    name="allowedAddresses"
                    validators={{
                      onChange: ({ value }) => {
                        // Run full schema validation for cross-field validation
                        const result = votingPoolSchema.safeParse({
                          ...form.state.values,
                          allowedAddresses: value,
                        });

                        if (!result.success) {
                          const addressError = result.error.issues.find(
                            (issue) => issue.path[0] === 'allowedAddresses'
                          );
                          return addressError?.message;
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => <AllowedAddressesField disabled={isSubmitting} />}
                  </form.AppField>
                )
              }
            </form.Subscribe>

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
