/**
 * Progress Step List Component
 *
 * Displays all transaction progress steps with proper status
 */
import { ProgressStep } from './progress-step';

type ProgressStepType = 'idle' | 'saving' | 'wallet' | 'confirming' | 'success' | 'error';

interface ProgressStepListProps {
  currentStep: ProgressStepType;
}

export function ProgressStepList({ currentStep }: ProgressStepListProps) {
  // Helper to determine step status
  const getStepStatus = (step: ProgressStepType): 'pending' | 'loading' | 'success' | 'error' => {
    const stepOrder = ['idle', 'saving', 'wallet', 'confirming', 'success', 'error'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);

    if (currentIndex === stepIndex) return 'loading';
    if (currentIndex > stepIndex) return 'success';
    return 'pending';
  };

  const isStepCompleted = (step: ProgressStepType) => {
    const completedSteps = ['confirming', 'success'];
    return completedSteps.includes(currentStep) && getStepStatus(step) === 'success';
  };

  return (
    <div className="space-y-3">
      {/* Step 1: Saving data */}
      <ProgressStep
        title="Saving poll data"
        description="Storing your voting pool information..."
        status={getStepStatus('saving')}
      />

      {/* Step 2: Wallet confirmation */}
      <ProgressStep
        title="Wallet confirmation"
        description={
          currentStep === 'wallet' ? (
            <span className="text-primary font-medium">
              Please confirm the transaction in your wallet extension
            </span>
          ) : (
            'Approve the transaction in your wallet'
          )
        }
        status={getStepStatus('wallet')}
      />

      {/* Step 3: Blockchain confirmation */}
      <ProgressStep
        title="Blockchain confirmation"
        description={
          currentStep === 'confirming'
            ? 'Waiting for transaction to be confirmed...'
            : 'Transaction will be confirmed on blockchain'
        }
        status={getStepStatus('confirming')}
      />
    </div>
  );
}
