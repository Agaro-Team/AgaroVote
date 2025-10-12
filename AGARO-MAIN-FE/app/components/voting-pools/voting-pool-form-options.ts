import { isAddress } from 'viem';
import { z } from 'zod';

import { formOptions } from '@tanstack/react-form';

/**
 * Zod Schema for Voting Pool Form Validation
 */
const votingPoolSchema = z
  .object({
    title: z
      .string()
      .max(200, 'Title must be 200 characters or less')
      .refine((val) => val.trim().length > 0, 'Title cannot be empty'),
    description: z
      .string()
      .max(1000, 'Description must be 1000 characters or less')
      .refine((val) => val.trim().length > 0, 'Description cannot be empty'),
    choices: z
      .array(z.string().min(1, 'Choice cannot be empty'))
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
    isPrivate: z.boolean(),
    allowedAddresses: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    // Validate each address
    const validAddresses = data.allowedAddresses.filter((addr) => addr.trim() !== '');

    // Check if all addresses are valid Ethereum addresses
    for (let i = 0; i < validAddresses.length; i++) {
      if (!isAddress(validAddresses[i])) {
        ctx.addIssue({
          code: 'custom',
          message: `Address not a valid Ethereum address`,
          path: ['allowedAddresses', i],
        });

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
  });

type CreateVotingPoolFormData = z.infer<typeof votingPoolSchema>;

const defaultValues: CreateVotingPoolFormData = {
  title: '',
  description: '',
  choices: ['', ''],
  expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  isPrivate: false,
  allowedAddresses: [],
};

export const votingPoolFormOptions = formOptions({
  defaultValues,
  validators: {
    onChange: votingPoolSchema,
  },
});
