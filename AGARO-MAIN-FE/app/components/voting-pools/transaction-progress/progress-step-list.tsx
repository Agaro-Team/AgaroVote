/**
 * Progress Step List Component
 *
 * Displays all transaction progress steps with proper status
 */
import { ProgressStep } from './progress-step';

type ProgressStepType =
  | 'idle'
  | 'saving'
  | 'wallet'
  | 'confirming'
  | 'verifying'
  | 'success'
  | 'error';

interface ProgressStepListProps {
  currentStep: ProgressStepType;
  offChainHash?: string | null;
  onChainHash?: string | null;
  verificationError?: string | null;
}

export function ProgressStepList({
  currentStep,
  offChainHash,
  onChainHash,
  verificationError,
}: ProgressStepListProps) {
  // Helper to determine step status
  const getStepStatus = (step: ProgressStepType): 'pending' | 'loading' | 'success' | 'error' => {
    const stepOrder = ['idle', 'saving', 'wallet', 'confirming', 'verifying', 'success', 'error'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);

    if (currentStep === 'error' && step === 'verifying') return 'error';
    if (currentIndex === stepIndex) return 'loading';
    if (currentIndex > stepIndex) return 'success';
    return 'pending';
  };

  const isStepCompleted = (step: ProgressStepType) => {
    const completedSteps = ['confirming', 'verifying', 'success'];
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

      {/* Step 4: Hash verification */}
      <ProgressStep
        title="Hash verification"
        description={
          currentStep === 'verifying' ? (
            <span className="text-primary font-medium">
              Waiting for blockchain event and verifying hash match...
            </span>
          ) : currentStep === 'success' ? (
            'Hashes verified successfully!'
          ) : currentStep === 'error' && verificationError ? (
            <span className="text-red-600 dark:text-red-400">{verificationError}</span>
          ) : (
            'Verify on-chain and off-chain data match'
          )
        }
        status={currentStep === 'error' && verificationError ? 'error' : getStepStatus('verifying')}
        additionalInfo={
          <>
            {offChainHash && currentStep === 'verifying' && (
              <p className="text-xs text-muted-foreground">
                Off-chain: {offChainHash.slice(0, 10)}...{offChainHash.slice(-8)}
              </p>
            )}
            {onChainHash && currentStep === 'success' && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ On-chain: {onChainHash.slice(0, 10)}...{onChainHash.slice(-8)}
              </p>
            )}
          </>
        }
      />
    </div>
  );
}
