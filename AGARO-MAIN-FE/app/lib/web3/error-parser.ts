/**
 * Wagmi/Viem Error Parser Utility
 *
 * Converts technical Wagmi and Viem contract errors into user-friendly messages.
 * Supports various error types from transactions, contract interactions, and wallet operations.
 */
import type { WriteContractErrorType } from '@wagmi/core';

export interface ParsedError {
  title: string;
  message: string;
  technical?: string;
}

/**
 * Parse Wagmi contract error into user-friendly message
 * @param error - The error from Wagmi/viem contract interaction
 * @returns Parsed error with user-friendly title and message
 */
export function parseWagmiError(error: unknown): ParsedError {
  if (!error) {
    return {
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  const wagmiError = error as WriteContractErrorType;
  const errorName = wagmiError.name || '';
  const errorMessage = wagmiError.message || '';

  // Store technical message for debugging
  const technical = errorMessage;

  // User rejected the transaction
  if (
    errorName.includes('UserRejectedRequest') ||
    errorMessage.includes('User rejected') ||
    errorMessage.includes('user rejected') ||
    errorMessage.includes('User denied')
  ) {
    return {
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction in your wallet.',
      technical,
    };
  }

  // Insufficient funds for gas
  if (
    errorName.includes('InsufficientFunds') ||
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('exceeds balance')
  ) {
    return {
      title: 'Insufficient Funds',
      message:
        "You don't have enough funds to pay for gas fees. Please add more funds to your wallet.",
      technical,
    };
  }

  // Contract execution reverted
  if (
    errorName.includes('ContractFunctionExecution') ||
    errorMessage.includes('execution reverted')
  ) {
    // Try to extract the revert reason
    const revertReason = extractRevertReason(errorMessage);

    if (revertReason) {
      return {
        title: 'Transaction Failed',
        message: parseContractRevertReason(revertReason),
        technical,
      };
    }

    return {
      title: 'Transaction Failed',
      message:
        'The smart contract rejected your transaction. Please check your input and try again.',
      technical,
    };
  }

  // Transaction execution error
  if (
    errorName.includes('TransactionExecution') ||
    errorMessage.includes('transaction execution')
  ) {
    return {
      title: 'Transaction Failed',
      message: 'The transaction could not be executed. Please try again.',
      technical,
    };
  }

  // Gas estimation error
  if (errorMessage.includes('gas required exceeds') || errorMessage.includes('out of gas')) {
    return {
      title: 'Gas Estimation Failed',
      message:
        'Unable to estimate gas for this transaction. The transaction might fail or require manual gas adjustment.',
      technical,
    };
  }

  // Network/RPC errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('RPC') ||
    errorMessage.includes('connection')
  ) {
    return {
      title: 'Network Error',
      message:
        'Unable to connect to the blockchain network. Please check your connection and try again.',
      technical,
    };
  }

  // Chain mismatch
  if (errorMessage.includes('chain') || errorMessage.includes('Chain')) {
    return {
      title: 'Wrong Network',
      message: 'Please switch to the correct network in your wallet and try again.',
      technical,
    };
  }

  // Nonce errors
  if (errorMessage.includes('nonce') || errorMessage.includes('Nonce')) {
    return {
      title: 'Transaction Order Error',
      message: "There's an issue with transaction ordering. Please try again or reset your wallet.",
      technical,
    };
  }

  // Wallet not connected
  if (errorMessage.includes('wallet') || errorMessage.includes('account')) {
    return {
      title: 'Wallet Not Connected',
      message: 'Please connect your wallet to continue.',
      technical,
    };
  }

  // Contract not found/deployed
  if (
    errorMessage.includes('contract') &&
    (errorMessage.includes('not found') || errorMessage.includes('not deployed'))
  ) {
    return {
      title: 'Contract Not Available',
      message:
        'The smart contract is not available on this network. Please switch to a supported network.',
      technical,
    };
  }

  // ABI encoding errors
  if (
    errorMessage.includes('ABI') ||
    errorMessage.includes('encode') ||
    errorMessage.includes('decode')
  ) {
    return {
      title: 'Invalid Input',
      message: 'The input data is invalid. Please check your values and try again.',
      technical,
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long. Please try again.',
      technical,
    };
  }

  // Version mismatch (specific to your contract)
  if (errorMessage.includes('version') || errorMessage.includes('Version')) {
    return {
      title: 'Contract Version Error',
      message: 'The contract version is not supported. Please refresh the page and try again.',
      technical,
    };
  }

  // Generic fallback
  return {
    title: 'Transaction Failed',
    message:
      'An unexpected error occurred. Please try again or contact support if the issue persists.',
    technical,
  };
}

/**
 * Extract revert reason from error message
 * @param errorMessage - The error message from contract
 * @returns Extracted revert reason or null
 */
function extractRevertReason(errorMessage: string): string | null {
  // Try to extract reason from common patterns
  const patterns = [
    /reverted with reason string '([^']+)'/,
    /revert ([^,\n]+)/,
    /execution reverted: ([^,\n]+)/,
  ];

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Parse contract-specific revert reasons into user-friendly messages
 * @param reason - The revert reason from contract
 * @returns User-friendly message
 */
function parseContractRevertReason(reason: string): string {
  const lowerReason = reason.toLowerCase();

  // Common contract revert reasons
  if (lowerReason.includes('unauthorized') || lowerReason.includes('not authorized')) {
    return 'You are not authorized to perform this action.';
  }

  if (lowerReason.includes('insufficient balance') || lowerReason.includes('not enough')) {
    return 'Insufficient balance to complete this transaction.';
  }

  if (lowerReason.includes('already exists') || lowerReason.includes('duplicate')) {
    return 'This item already exists. Please check and try again.';
  }

  if (lowerReason.includes('not found') || lowerReason.includes('does not exist')) {
    return 'The requested item was not found.';
  }

  if (lowerReason.includes('expired') || lowerReason.includes('deadline')) {
    return 'The deadline for this action has passed.';
  }

  if (lowerReason.includes('too early') || lowerReason.includes('not yet')) {
    return 'This action cannot be performed yet. Please try again later.';
  }

  if (lowerReason.includes('too late') || lowerReason.includes('ended')) {
    return 'This action is no longer available.';
  }

  if (lowerReason.includes('invalid') || lowerReason.includes('incorrect')) {
    return 'Invalid input provided. Please check your data and try again.';
  }

  if (lowerReason.includes('paused')) {
    return 'This contract is currently paused. Please try again later.';
  }

  if (lowerReason.includes('limit') || lowerReason.includes('maximum')) {
    return 'You have reached the maximum limit for this action.';
  }

  // Return the original reason if no match (it might already be user-friendly)
  return reason;
}

/**
 * Format parsed error for toast notification
 * @param parsedError - The parsed error object
 * @returns Object with title and description for toast
 */
export function formatErrorForToast(parsedError: ParsedError): {
  title: string;
  description: string;
} {
  return {
    title: parsedError.title,
    description: parsedError.message,
  };
}

/**
 * Quick helper to parse error and return toast-ready format
 * @param error - The error from Wagmi/viem
 * @returns Object ready for toast notification
 */
export function parseWagmiErrorForToast(error: unknown): {
  title: string;
  description: string;
} {
  const parsed = parseWagmiError(error);
  return formatErrorForToast(parsed);
}
