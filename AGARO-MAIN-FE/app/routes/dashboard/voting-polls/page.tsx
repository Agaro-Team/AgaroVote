/**
 * Browse All Voting Polls Page
 *
 * Displays all created voting polls with filtering and search capabilities.
 */
import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import { Page } from '~/components/page-header';
import { Button } from '~/components/ui/button';
import { VotingPollsFilters } from '~/routes/dashboard/voting-polls/components/voting-polls-filters';
import { VotingPollsList } from '~/routes/dashboard/voting-polls/components/voting-polls-list';

export default function VotingPollsPage() {
  return (
    <div className="flex flex-1 flex-col gap-10 p-4 pt-0">
      <Page.Header>
        <Page.Content>
          <Page.Title>All Voting Polls</Page.Title>
          <Page.Description>
            Browse and participate in voting polls created by the community. Create your own polls
            to engage voters.
          </Page.Description>
        </Page.Content>

        <Button asChild>
          <Link to="/dashboard/voting-polls/create">
            <Plus className="h-4 w-4 mr-2" />
            Create New Poll
          </Link>
        </Button>
      </Page.Header>

      <VotingPollsFilters />

      {/* Voting Polls List */}
      <VotingPollsList />
    </div>
  );
}
