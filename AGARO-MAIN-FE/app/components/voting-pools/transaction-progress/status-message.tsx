/**
 * Status Message Component
 *
 * Displays success or error messages
 */

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
      <p className="font-medium mb-1">
        {isSuccess ? '✓' : '✗'} {title}
      </p>
      <p>{description}</p>
    </div>
  );
}
