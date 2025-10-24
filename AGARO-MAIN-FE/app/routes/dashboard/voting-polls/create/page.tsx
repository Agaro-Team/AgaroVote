/**
 * Create Voting Poll Page
 *
 * Page for creating new voting polls on the blockchain.
 * Protected by SIWE authentication middleware.
 */
import { Page } from '~/components/page-header';
import { siweAuthMiddleware } from '~/lib/middleware/auth';

import { CreateVotingPollForm } from './components/create-voting-poll-form';

/**
 * Apply SIWE authentication middleware
 * Ensures user is authenticated before accessing this route
 */
export const middleware = [siweAuthMiddleware];

export const handle = {
  breadcrumb: 'Create Poll',
};

export default function CreateVotingPollPage() {
  return (
    <div className="flex flex-1 flex-col gap-10 p-4 pt-0">
      {/* Page Header */}
      <Page.Header>
        <Page.Content>
          <Page.Title>Create Voting Poll</Page.Title>
          <Page.Description>
            Create a new on-chain voting poll. All votes will be securely recorded on the blockchain
          </Page.Description>
        </Page.Content>
      </Page.Header>

      {/* Form */}
      <div className="max-w-full">
        <CreateVotingPollForm />
      </div>
    </div>
  );
}
