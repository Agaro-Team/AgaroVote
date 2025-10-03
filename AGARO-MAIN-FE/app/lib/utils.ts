import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Merge multiple records into a single record
 * @param keys
 * @returns
 */
export const mergeRecords = <T extends Record<string, any>>(...keys: T[]) => {
  return keys.reduce((acc, key) => {
    return { ...acc, ...key };
  }, {} as T);
};
