/**
 * Poll Meta - Displays poll metadata (dates, choices count, etc.)
 */
import { Calendar, Clock, Lock, Users } from 'lucide-react';
import { formatDate } from '~/lib/date-utils';

import { useTimeRemaining } from '../hooks/use-time-remaining';
import { useVoteContext } from '../vote-context';

export function PollMeta() {
  const { poll } = useVoteContext();
  const timeRemaining = useTimeRemaining();

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      <MetaItem icon={Calendar}>
        {formatDate(poll.startDate, 'DD MMM YYYY')} - {formatDate(poll.endDate, 'DD MMM YYYY')}
      </MetaItem>

      <MetaItem icon={Clock}>{timeRemaining}</MetaItem>

      <MetaItem icon={Users}>
        {poll.choices.length} {poll.choices.length === 1 ? 'choice' : 'choices'}
      </MetaItem>

      {poll.isPrivate && <MetaItem icon={Lock}>Private poll</MetaItem>}
    </div>
  );
}

interface MetaItemProps {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function MetaItem({ icon: Icon, children }: MetaItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
}
