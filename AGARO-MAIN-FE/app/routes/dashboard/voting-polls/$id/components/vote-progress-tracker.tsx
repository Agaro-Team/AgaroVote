/**
 * Vote Progress Tracker Component
 *
 * Displays the step-by-step progress of the voting transaction process
 */
import {
  Check,
  CheckCircle2,
  Database,
  Link as LinkIcon,
  Loader2,
  Shield,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

import { useVoteContext } from './vote-context';

export type VoteStep =
  | 'idle'
  | 'wallet-confirmation'
  | 'blockchain-submission'
  | 'blockchain-confirmation'
  | 'database-storage'
  | 'complete';

export type VoteError =
  | 'wallet-rejected'
  | 'blockchain-failed'
  | 'database-failed'
  | 'unknown-error';

interface ProgressStep {
  id: VoteStep;
  errorId: VoteError | null;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROGRESS_STEPS: ProgressStep[] = [
  {
    id: 'database-storage',
    errorId: 'database-failed',
    label: 'Storing Vote Data',
    description: 'Recording your vote in our database',
    icon: Database,
  },
  {
    id: 'wallet-confirmation',
    errorId: 'wallet-rejected',
    label: 'Wallet Confirmation',
    description: 'Waiting for you to confirm in your wallet',
    icon: Wallet,
  },
  {
    id: 'blockchain-submission',
    errorId: 'blockchain-failed',
    label: 'Submitting to Blockchain',
    description: 'Transaction is being sent to the network',
    icon: LinkIcon,
  },
  {
    id: 'blockchain-confirmation',
    errorId: 'unknown-error',
    label: 'Blockchain Confirmation',
    description: 'Waiting for network confirmation',
    icon: Shield,
  },
  {
    id: 'complete',
    errorId: null,
    label: 'Complete',
    description: 'Your vote has been successfully recorded!',
    icon: CheckCircle2,
  },
];

export function VoteProgressTracker() {
  const { currentVoteStep, voteTxHash, voteError } = useVoteContext();

  // Don't show the tracker if voting hasn't started
  if (currentVoteStep === 'idle') {
    return null;
  }

  const currentStepIndex = PROGRESS_STEPS.findIndex((step) => step.id === currentVoteStep);

  // Find which step has the error (if any)
  const errorStepIndex = voteError
    ? PROGRESS_STEPS.findIndex((step) => step.errorId === voteError.errorType)
    : -1;

  const hasError = errorStepIndex !== -1;

  return (
    <Card
      className={cn(
        'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent',
        hasError && 'border-destructive/20 from-destructive/5'
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {hasError ? (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              Vote Failed
            </>
          ) : (
            <>
              <Loader2
                className={cn(
                  'h-4 w-4',
                  currentVoteStep === 'complete' ? 'hidden' : 'animate-spin text-primary'
                )}
              />
              {currentVoteStep === 'complete' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Vote Submitted Successfully!
                </>
              ) : (
                'Processing Your Vote...'
              )}
            </>
          )}
        </CardTitle>
        {hasError && voteError && (
          <p className="text-xs text-destructive mt-2">{voteError.message}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {PROGRESS_STEPS.map((step, index) => {
          const isCurrent =
            step.id === currentVoteStep && currentVoteStep !== 'complete' && !hasError;
          const isCompleted =
            index < currentStepIndex ||
            (currentVoteStep === 'complete' && index <= currentStepIndex);
          const isUpcoming = index > currentStepIndex && !hasError;
          const isError = hasError && index === errorStepIndex;
          const isCancelled = hasError && index > errorStepIndex;

          return (
            <StepItem
              key={step.id}
              step={step}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isUpcoming={isUpcoming}
              isError={isError}
              isCancelled={isCancelled}
              isLast={index === PROGRESS_STEPS.length - 1}
            />
          );
        })}

        {/* Transaction Hash Link */}
        {voteTxHash && (
          <div className="pt-3 border-t mt-4">
            <a
              href={`https://etherscan.io/tx/${voteTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <LinkIcon className="h-3 w-3" />
              View on Explorer: {voteTxHash.slice(0, 10)}...{voteTxHash.slice(-8)}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StepItemProps {
  step: ProgressStep;
  isCurrent: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
  isError: boolean;
  isCancelled: boolean;
  isLast: boolean;
}

function StepItem({
  step,
  isCurrent,
  isCompleted,
  isUpcoming,
  isError,
  isCancelled,
  isLast,
}: StepItemProps) {
  const Icon = step.icon;

  return (
    <div className="relative flex gap-3">
      {/* Connector Line */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-[15px] top-8 w-0.5 h-[calc(100%+0.75rem)] -translate-x-1/2',
            isCompleted && 'bg-green-500',
            (isError || isCancelled) && 'bg-destructive',
            !isCompleted && !isError && !isCancelled && 'bg-border'
          )}
        />
      )}

      {/* Icon Circle */}
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          isCurrent && 'border-primary bg-primary text-primary-foreground animate-pulse',
          isCompleted && 'border-green-500 bg-green-500 text-white',
          isError && 'border-destructive bg-destructive text-destructive-foreground',
          isCancelled && 'border-destructive bg-background text-destructive',
          isUpcoming && 'border-muted bg-background text-muted-foreground'
        )}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
        ) : isError ? (
          <XCircle className="h-4 w-4" />
        ) : isCancelled ? (
          <X className="h-4 w-4" />
        ) : isCurrent ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <p
          className={cn(
            'font-medium text-sm leading-none mb-1 transition-colors',
            isCurrent && 'text-primary',
            isCompleted && 'text-green-600 dark:text-green-500',
            (isError || isCancelled) && 'text-destructive',
            isUpcoming && 'text-muted-foreground'
          )}
        >
          {step.label}
        </p>
        <p
          className={cn(
            'text-xs transition-colors',
            isCurrent && 'text-muted-foreground',
            isCompleted && 'text-muted-foreground',
            isError && 'text-destructive/80',
            isCancelled && 'text-muted-foreground/60',
            isUpcoming && 'text-muted-foreground/60'
          )}
        >
          {isError ? 'Failed - ' + step.description : isCancelled ? 'Cancelled' : step.description}
        </p>
      </div>
    </div>
  );
}
