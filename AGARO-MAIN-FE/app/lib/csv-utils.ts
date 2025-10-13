/**
 * CSV Utilities
 *
 * Utilities for handling CSV file operations including:
 * - Ethereum address validation
 * - CSV parsing and validation
 * - Template generation and download
 */
import Papa from 'papaparse';

/**
 * Validates if a string is a valid Ethereum address
 * Format: 0x followed by 40 hexadecimal characters
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;

  // Remove whitespace
  const trimmed = address.trim();

  // Check basic format: 0x + 40 hex characters
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(trimmed);
}

/**
 * Represents a validated address with its status
 */
export interface ValidatedAddress {
  address: string;
  isValid: boolean;
  error?: string;
  lineNumber: number;
}

/**
 * Result of CSV parsing and validation
 */
export interface CSVParseResult {
  validAddresses: string[];
  invalidAddresses: ValidatedAddress[];
  duplicates: string[];
  totalRows: number;
  isValid: boolean;
  error?: string;
}

/**
 * Validates and parses a CSV file containing Ethereum addresses
 *
 * @param file - The CSV file to parse
 * @param maxRows - Maximum number of rows allowed (default: 10000)
 * @param maxFileSize - Maximum file size in bytes (default: 1MB)
 * @returns Promise with parse result
 */
export async function parseAddressesCSV(
  file: File,
  maxRows: number = 10000,
  maxFileSize: number = 1024 * 1024 // 1MB
): Promise<CSVParseResult> {
  // Validate file size
  if (file.size > maxFileSize) {
    return {
      validAddresses: [],
      invalidAddresses: [],
      duplicates: [],
      totalRows: 0,
      isValid: false,
      error: `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`,
    };
  }

  // Validate file type
  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
    return {
      validAddresses: [],
      invalidAddresses: [],
      duplicates: [],
      totalRows: 0,
      isValid: false,
      error: 'Invalid file type. Please upload a CSV file.',
    };
  }

  return new Promise((resolve) => {
    Papa.parse<{ address: string }>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const validAddresses: string[] = [];
        const invalidAddresses: ValidatedAddress[] = [];
        const seenAddresses = new Set<string>();
        const duplicates: string[] = [];

        // Check if 'address' column exists
        if (results.meta.fields && !results.meta.fields.includes('address')) {
          resolve({
            validAddresses: [],
            invalidAddresses: [],
            duplicates: [],
            totalRows: 0,
            isValid: false,
            error: "Invalid CSV format. Missing required column 'address'.",
          });
          return;
        }

        // Check row count
        if (results.data.length > maxRows) {
          resolve({
            validAddresses: [],
            invalidAddresses: [],
            duplicates: [],
            totalRows: results.data.length,
            isValid: false,
            error: `CSV contains ${results.data.length} rows. Maximum allowed is ${maxRows}.`,
          });
          return;
        }

        // Process each row
        results.data.forEach((row, index) => {
          const address = row.address?.trim();
          const lineNumber = index + 2; // +2 because of header and 0-based index

          if (!address) {
            invalidAddresses.push({
              address: '',
              isValid: false,
              error: 'Empty address',
              lineNumber,
            });
            return;
          }

          // Check for duplicates
          const lowerAddress = address.toLowerCase();
          if (seenAddresses.has(lowerAddress)) {
            duplicates.push(address);
            return;
          }

          // Validate address format
          if (!isValidEthereumAddress(address)) {
            invalidAddresses.push({
              address,
              isValid: false,
              error: 'Invalid Ethereum address format',
              lineNumber,
            });
            return;
          }

          // Valid address
          seenAddresses.add(lowerAddress);
          validAddresses.push(address);
        });

        resolve({
          validAddresses,
          invalidAddresses,
          duplicates,
          totalRows: results.data.length,
          isValid: invalidAddresses.length === 0,
        });
      },
      error: (error) => {
        resolve({
          validAddresses: [],
          invalidAddresses: [],
          duplicates: [],
          totalRows: 0,
          isValid: false,
          error: `Failed to parse CSV: ${error.message}`,
        });
      },
    });
  });
}

/**
 * Generates and downloads a CSV template file
 */
export function downloadAddressTemplate(): void {
  const template = `address
0x1234567890123456789012345678901234567890
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
0x0000000000000000000000000000000000000000`;

  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'address-template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Removes duplicate addresses from an array (case-insensitive)
 */
export function removeDuplicateAddresses(addresses: string[]): {
  uniqueAddresses: string[];
  duplicateCount: number;
} {
  const seen = new Set<string>();
  const uniqueAddresses: string[] = [];
  let duplicateCount = 0;

  addresses.forEach((address) => {
    const lowerAddress = address.toLowerCase();
    if (!seen.has(lowerAddress)) {
      seen.add(lowerAddress);
      uniqueAddresses.push(address);
    } else {
      duplicateCount++;
    }
  });

  return { uniqueAddresses, duplicateCount };
}
