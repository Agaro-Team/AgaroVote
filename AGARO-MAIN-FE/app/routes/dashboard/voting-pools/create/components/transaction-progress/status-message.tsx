/**
 * Status Message Component
 *
 * Displays success or error messages
 */
import { CheckCircle, CheckIcon, XCircle, XIcon } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error';
  title: string;
  description: string;
}

export function StatusMessage({ type, title, description }: StatusMessageProps) {
  const isSuccess = type === 'success';

  return (
    <div
      className={`mt-4 rounded-lg p-3 text-sm ${
        isSuccess
          ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200'
          : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {isSuccess ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        <p className="font-medium mb-1">{title}</p>
      </div>
      <p>{description}</p>
    </div>
  );
}
