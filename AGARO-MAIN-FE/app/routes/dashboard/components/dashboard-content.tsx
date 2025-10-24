import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { dashboardSummaryQueryOptions } from '~/lib/query-client/dashboard/queries';

import { useQuery } from '@tanstack/react-query';

import { ActivePollsList, DashboardError, DashboardStats, MyActivity } from '../components';

export function DashboardContent() {
  const { error, refetch } = useQuery(dashboardSummaryQueryOptions);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {error && <DashboardError error={error} onRetry={refetch} />}
      {/* Stats Cards */}
      <DashboardStats />

      {/* Create Poll CTA */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Create Your Own Voting Poll</h3>
            <p className="text-sm text-muted-foreground">
              Launch a decentralized voting poll on the blockchain in minutes. Perfect for
              communities, DAOs, and organizations.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/dashboard/voting-polls/create">
              <Plus className="h-5 w-5 mr-2" />
              Create Poll
            </Link>
          </Button>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivePollsList />
        <MyActivity />
      </div>
    </div>
  );
}
