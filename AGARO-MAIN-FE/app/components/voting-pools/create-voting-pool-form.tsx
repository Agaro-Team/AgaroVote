/**
 * Create Voting Pool Form Component
 *
 * A complete form for creating new voting pools with validation,
 * smart contract integration, and user feedback.
 */
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAppForm } from '~/components/form/use-app-form';
import { Card } from '~/components/ui/card';
import { useCreateVotingPool } from '~/hooks/voting-pools/use-create-voting-pool';

import { useEffect } from 'react';

import { ChoicesArrayField } from './choices-array-field';

/**
 * Zod Schema for Voting Pool Form Validation
 */
const votingPoolSchema = z.object({
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
    } satisfies CreateVotingPoolFormData,
    onSubmit: async ({ value }) => {
      // Validate choices
      const validChoices = value.choices.filter((c) => c.trim() !== '');

      if (validChoices.length < 2) {
        toast.error('Please add at least 2 choices with names');
        return;
      }

      // Create the pool with candidatesTotal calculated
      // Note: Smart contract still uses "candidates" terminology
      createPool({
        title: value.title,
        description: value.description,
        candidates: validChoices, // Map "choices" to "candidates" for contract
        candidatesTotal: validChoices.length,
      });
    },
  });

  // Handle success
  useEffect(() => {
    if (isSuccess && txHash) {
      toast.success('Voting pool created successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });
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
