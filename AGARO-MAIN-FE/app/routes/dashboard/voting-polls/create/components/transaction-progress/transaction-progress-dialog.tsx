/**
 * Transaction Progress Dialog Component
 *
 * Shows the progress of creating a voting pool transaction
 */
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

import { ProgressStepList } from './progress-step-list';
import { StatusMessage } from './status-message';

type ProgressStep = 'idle' | 'saving' | 'wallet' | 'confirming' | 'success' | 'error';

interface TransactionProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressStep: ProgressStep;
  isSubmitting: boolean;
  offChainHash?: string | null;
  onChainHash?: string | null;
  verificationError?: string | null;
  error?: Error | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function TransactionProgressDialog({
  open,
  onOpenChange,
  progressStep,
  isSubmitting,
  offChainHash,
  onChainHash,
  verificationError,
  error,
  onClose,
  onConfirm,
}: TransactionProgressDialogProps) {
  // Get dialog title based on current step
  const getDialogTitle = () => {
    switch (progressStep) {
      case 'idle':
        return 'Confirm Transaction';
      case 'saving':
        return 'Saving Poll Data...';
      case 'wallet':
        return 'Wallet Confirmation Required';
      case 'confirming':
        return 'Confirming Transaction...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Failed';
      default:
        return 'Processing...';
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Only allow closing if not in progress
    if (!isSubmitting || progressStep === 'idle') {
      onOpenChange(open);
      if (!open) onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Initial confirmation state */}
          {progressStep === 'idle' && (
            <DialogDescription>
              Are you sure you want to create this voting pool? After confirming, you'll need to
              approve the transaction in your wallet.
              <br />
              <br />
              <strong>Important:</strong> Please don't close or refresh the page during this
              process.
            </DialogDescription>
          )}

          {/* Progress steps */}
          {progressStep !== 'idle' && (
            <>
              <ProgressStepList currentStep={progressStep} />

              {/* Success message */}
              {progressStep === 'success' && (
                <StatusMessage
                  type="success"
                  title="Voting Pool Created Successfully!"
                  description="Your voting pool has been created and stored on the blockchain. Redirecting to voting pools page..."
                />
              )}

              {/* Error message */}
              {progressStep === 'error' && (
                <StatusMessage
                  type="error"
                  title="Error"
                  description={
                    verificationError || error?.message || 'Transaction failed. Please try again.'
                  }
                />
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {progressStep === 'idle' && (
            <>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
                Confirm & Proceed
              </Button>
            </>
          )}

          {progressStep === 'error' && (
            <Button variant="outline" type="button" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
