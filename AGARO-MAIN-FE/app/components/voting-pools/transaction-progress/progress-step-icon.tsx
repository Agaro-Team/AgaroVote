/**
 * Progress Step Icon Component
 *
 * Displays the appropriate icon based on step status
 */

type IconStatus = 'pending' | 'loading' | 'success' | 'error';

interface ProgressStepIconProps {
  status: IconStatus;
}

export function ProgressStepIcon({ status }: ProgressStepIconProps) {
  if (status === 'loading') {
    return (
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    );
  }

  if (status === 'success') {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );
  }

  // Pending state
  return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
}
