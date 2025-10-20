/**
 * Active Polls List Component
 *
 * Displays list of currently active voting polls
 */
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import { dashboardSummaryQueryOptions } from '~/lib/query-client/dashboard/queries';

import { useQuery } from '@tanstack/react-query';

import { ActivePollsListSkeleton } from './dashboard-loading';

export function ActivePollsList() {
  const { data, isLoading, isFetching } = useQuery(dashboardSummaryQueryOptions);

  if (isLoading) {
    return (
      <Card className="col-span-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Active Voting Polls</h3>
            <p className="text-sm text-muted-foreground">Loading polls...</p>
          </div>
        </div>
        <ActivePollsListSkeleton />
      </Card>
    );
  }

  if (!data?.data) {
    return null;
  }

  const summary = data.data;
  const pollCount = summary.active_voting_polls.length;

  return (
    <Card className="col-span-4 p-6 relative">
      {/* Loading overlay for refetch */}
      {isFetching && !isLoading && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10 animate-in fade-in duration-200">
          <Spinner />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Active Voting Polls</h3>
          <p className="text-sm text-muted-foreground">
            {pollCount === 0
              ? 'No active polls'
              : `${pollCount} ${pollCount === 1 ? 'poll' : 'polls'} you can participate in`}
          </p>
        </div>
        <Link
          to="/dashboard/voting-polls"
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {pollCount === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>No active voting polls at the moment.</p>
          <p className="text-sm mt-1">Check back later or create your own poll!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summary.active_voting_polls.map((poll) => {
            const endsAt = new Date(poll.ends_at);
            const now = new Date();
            const timeLeft = endsAt.getTime() - now.getTime();
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

            let timeLeftText = '';
            if (daysLeft < 1) {
              const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
              timeLeftText = `${hoursLeft} ${hoursLeft === 1 ? 'hour' : 'hours'} left`;
            } else if (daysLeft === 1) {
              timeLeftText = '1 day left';
            } else if (daysLeft <= 7) {
              timeLeftText = `${daysLeft} days left`;
            } else {
              const weeksLeft = Math.ceil(daysLeft / 7);
              timeLeftText = `${weeksLeft} ${weeksLeft === 1 ? 'week' : 'weeks'} left`;
            }

            return (
              <div key={poll.id} className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/voting-polls/${poll.id}`}
                      className="text-sm font-medium leading-none hover:underline"
                    >
                      {poll.name}
                    </Link>
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                      Voting
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {poll.total_voted.toLocaleString()} {poll.total_voted === 1 ? 'vote' : 'votes'}{' '}
                    • {timeLeftText}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${poll.percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{poll.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
