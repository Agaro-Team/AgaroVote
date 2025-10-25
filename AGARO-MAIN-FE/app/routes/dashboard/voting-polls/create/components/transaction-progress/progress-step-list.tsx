/**
 * Progress Step List Component
 *
 * Displays all transaction progress steps with proper status
 */
import { ProgressStep } from './progress-step';

type ProgressStepType = 'idle' | 'saving' | 'wallet' | 'confirming' | 'success' | 'error';

interface StepError {
  step: 'saving' | 'wallet' | 'confirming';
  message: string;
}

interface ProgressStepListProps {
  currentStep: ProgressStepType;
  errorDetails?: StepError | null;
}

export function ProgressStepList({ currentStep, errorDetails }: ProgressStepListProps) {
  // Helper to determine step status
  const getStepStatus = (step: ProgressStepType): 'pending' | 'loading' | 'success' | 'error' => {
    // If there's an error at this specific step
    if (errorDetails && errorDetails.step === step) {
      return 'error';
    }

    const stepOrder = ['idle', 'saving', 'wallet', 'confirming', 'success', 'error'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);

    // If we're in error state, mark steps after the error as error
    if (currentStep === 'error' && errorDetails) {
      const errorStepIndex = stepOrder.indexOf(errorDetails.step);
      if (stepIndex > errorStepIndex) {
        return 'error';
      }
      if (stepIndex < errorStepIndex) {
        return 'success';
      }
    }

    if (currentIndex === stepIndex) return 'loading';
    if (currentIndex > stepIndex) return 'success';
    return 'pending';
  };

  const isStepCompleted = (step: ProgressStepType) => {
    const completedSteps = ['confirming', 'success'];
    return completedSteps.includes(currentStep) && getStepStatus(step) === 'success';
  };

  // Helper to get error message for a specific step
  const getErrorMessage = (step: 'saving' | 'wallet' | 'confirming') => {
    if (errorDetails && errorDetails.step === step) {
      return (
        <span className="text-destructive font-medium text-xs">Error: {errorDetails.message}</span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Step 1: Saving data */}
      <ProgressStep
        title="Saving poll data"
        description={
          errorDetails?.step === 'saving'
            ? getErrorMessage('saving')
            : 'Storing your voting poll information...'
        }
        status={getStepStatus('saving')}
      />

      {/* Step 2: Wallet confirmation */}
      <ProgressStep
        title="Wallet confirmation"
        description={
          errorDetails?.step === 'wallet' ? (
            getErrorMessage('wallet')
          ) : currentStep === 'wallet' ? (
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
          errorDetails?.step === 'confirming'
            ? getErrorMessage('confirming')
            : currentStep === 'confirming'
              ? 'Waiting for transaction to be confirmed...'
              : 'Transaction will be confirmed on blockchain'
        }
        status={getStepStatus('confirming')}
      />
    </div>
  );
}
