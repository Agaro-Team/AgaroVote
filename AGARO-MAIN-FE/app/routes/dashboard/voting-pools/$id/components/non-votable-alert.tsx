/**
 * Non-Votable Alert - Shows when user cannot vote
 */
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { formatDate } from '~/lib/date-utils';

import { usePollStatus } from '../hooks/use-poll-status';
import { useVoteContext } from '../vote-context';

export function NonVotableAlert() {
  const { poll, canVote } = useVoteContext();
  const { statusConfig } = usePollStatus();

  if (canVote) return null;

  return (
    <Alert>
      <AlertTitle className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          {statusConfig.description}
        </div>
      </AlertTitle>
      <AlertDescription>
        <p className="text-sm text-muted-foreground">
          {poll.hasEnded && 'Voting has closed for this poll.'}
          {!poll.hasStarted && `Voting will start on ${formatDate(poll.startDate, 'DD MMM YYYY')}.`}
        </p>
      </AlertDescription>
    </Alert>
  );
}
