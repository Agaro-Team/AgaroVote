import type { DateRange } from 'react-day-picker';
import { isAddress } from 'viem';
import { z } from 'zod';

import { formOptions, revalidateLogic } from '@tanstack/react-form';

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
    votingPeriod: z
      .object({
        from: z.date({
          message: 'Start date is required',
        }),
        to: z.date({
          message: 'End date is required',
        }),
      })
      .refine((period) => period.from && period.to, {
        message: 'Both start and end dates are required',
      })
      .refine(
        (period) => {
          if (!period.from || !period.to) return true; // Skip if dates are missing
          return period.to > period.from;
        },
        {
          message: 'End date must be after start date',
        }
      ),
    isPrivate: z.boolean(),
    allowedAddresses: z
      .array(z.string().min(1, 'Address cannot be empty'))
      .max(500, 'Maximum 500 addresses allowed'),
    rewardShare: z.string().refine((val) => {
      const number = Number(val);
      return number >= 0;
    }, 'Reward share cannot be negative'),
    isTokenRequired: z.boolean(),
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

type CreateVotingPollFormData = z.infer<typeof votingPoolSchema>;

// Helper function to get default date range (starts now, ends in 7 days)
const getDefaultVotingPeriod = (): { from: Date; to: Date } => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    from: now,
    to: nextWeek,
  };
};

const defaultValues: CreateVotingPollFormData = {
  title: '',
  description: '',
  choices: ['', ''],
  votingPeriod: getDefaultVotingPeriod(),
  isPrivate: false,
  allowedAddresses: [],
  rewardShare: '0',
  isTokenRequired: false,
};

export const votingPollFormOptions = formOptions({
  defaultValues,
  validationLogic: revalidateLogic(),
  validators: {
    onDynamic: votingPoolSchema,
  },
});
