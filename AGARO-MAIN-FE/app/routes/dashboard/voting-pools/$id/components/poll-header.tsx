/**
 * Poll Header - Displays poll title, description and status
 */
import { Badge } from '~/components/ui/badge';

import { usePollStatus } from '../hooks/use-poll-status';
import { useVoteContext } from '../vote-context';

export function PollHeader() {
  const { poll } = useVoteContext();
  const { statusConfig } = usePollStatus();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{poll.title}</h1>
          <p className="text-muted-foreground">{poll.description}</p>
        </div>
        <Badge variant={statusConfig.variant} className="gap-1.5 px-3 py-1">
          <StatusIcon className="h-4 w-4" />
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  );
}
