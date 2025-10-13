/**
 * Hook to calculate time remaining for a poll
 */
import { useVoteContext } from '../vote-context';

export function useTimeRemaining(): string {
  const { poll } = useVoteContext();

  if (poll.hasEnded) return 'Ended';
  if (!poll.hasStarted) return 'Not started';

  const now = new Date();
  const endDate = new Date(poll.endDate);
  const timeRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return `${daysRemaining}d ${hoursRemaining}h remaining`;
}
