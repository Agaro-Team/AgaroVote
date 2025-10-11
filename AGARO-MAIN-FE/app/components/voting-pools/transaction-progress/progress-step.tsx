/**
 * Progress Step Component
 *
 * Displays a single step in the transaction progress
 */
import { ProgressStepIcon } from './progress-step-icon';

type StepStatus = 'pending' | 'loading' | 'success' | 'error';

interface ProgressStepProps {
  title: string;
  description: string | React.ReactNode;
  status: StepStatus;
  additionalInfo?: React.ReactNode;
}

export function ProgressStep({ title, description, status, additionalInfo }: ProgressStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <ProgressStepIcon status={status} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {additionalInfo && <div className="mt-1">{additionalInfo}</div>}
      </div>
    </div>
  );
}
