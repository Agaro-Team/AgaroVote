/**
 * Hook to determine poll status configuration
 */
import { CheckCircle2, Clock, TrendingUp, Vote } from 'lucide-react';

import { useVoteContext } from '../components/vote-context';

type StatusVariant = 'default' | 'secondary' | 'outline';

interface StatusConfig {
  label: string;
  variant: StatusVariant;
  icon: typeof Vote;
  description: string;
}

export function usePollStatus(): { statusConfig: StatusConfig } {
  const { poll } = useVoteContext();

  if (poll.hasEnded) {
    return {
      statusConfig: {
        label: 'Ended',
        variant: 'secondary',
        icon: CheckCircle2,
        description: 'This poll has ended',
      },
    };
  }

  if (!poll.hasStarted) {
    return {
      statusConfig: {
        label: 'Upcoming',
        variant: 'outline',
        icon: Clock,
        description: 'This poll has not started yet',
      },
    };
  }

  return {
    statusConfig: {
      label: 'Active',
      variant: 'default',
      icon: Vote,
      description: 'Information',
    },
  };
}
