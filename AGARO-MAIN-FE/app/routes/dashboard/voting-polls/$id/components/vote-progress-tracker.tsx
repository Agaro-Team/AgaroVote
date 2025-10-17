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
  | 'verification'
  | 'complete';

interface ProgressStep {
  id: VoteStep;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROGRESS_STEPS: ProgressStep[] = [
  {
    id: 'wallet-confirmation',
    label: 'Wallet Confirmation',
    description: 'Waiting for you to confirm in your wallet',
    icon: Wallet,
  },
  {
    id: 'blockchain-submission',
    label: 'Submitting to Blockchain',
    description: 'Transaction is being sent to the network',
    icon: LinkIcon,
  },
  {
    id: 'blockchain-confirmation',
    label: 'Blockchain Confirmation',
    description: 'Waiting for network confirmation',
    icon: Shield,
  },
  {
    id: 'database-storage',
    label: 'Storing Vote Data',
    description: 'Recording your vote in our database',
    icon: Database,
  },
  {
    id: 'verification',
    label: 'Verification',
    description: 'Verifying transaction and vote integrity',
    icon: Shield,
  },
  {
    id: 'complete',
    label: 'Complete',
    description: 'Your vote has been successfully recorded!',
    icon: CheckCircle2,
  },
];

export function VoteProgressTracker() {
  const { currentVoteStep, voteTxHash } = useVoteContext();

  // Don't show the tracker if voting hasn't started
  if (currentVoteStep === 'idle') {
    return null;
  }

  const currentStepIndex = PROGRESS_STEPS.findIndex((step) => step.id === currentVoteStep);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {PROGRESS_STEPS.map((step, index) => {
          const isCurrent = step.id === currentVoteStep && currentVoteStep !== 'complete';
          const isCompleted =
            index < currentStepIndex ||
            (currentVoteStep === 'complete' && index <= currentStepIndex);
          const isUpcoming = index > currentStepIndex;

          return (
            <StepItem
              key={step.id}
              step={step}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isUpcoming={isUpcoming}
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
  isLast: boolean;
}

function StepItem({ step, isCurrent, isCompleted, isUpcoming, isLast }: StepItemProps) {
  const Icon = step.icon;

  return (
    <div className="relative flex gap-3">
      {/* Connector Line */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-[15px] top-8 w-0.5 h-[calc(100%+0.75rem)] -translate-x-1/2',
            isCompleted ? 'bg-green-500' : 'bg-border'
          )}
        />
      )}

      {/* Icon Circle */}
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          isCurrent && 'border-primary bg-primary text-primary-foreground animate-pulse',
          isCompleted && 'border-green-500 bg-green-500 text-white',
          isUpcoming && 'border-muted bg-background text-muted-foreground'
        )}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
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
            isUpcoming && 'text-muted-foreground/60'
          )}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}
