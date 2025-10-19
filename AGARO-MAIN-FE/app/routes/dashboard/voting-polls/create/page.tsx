/**
 * Create Voting Poll Page
 *
 * Page for creating new voting polls on the blockchain.
 * Protected by SIWE authentication middleware.
 */
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { siweAuthMiddleware } from '~/lib/middleware/auth';

import { CreateVotingPollForm } from './components/create-voting-poll-form';

/**
 * Apply SIWE authentication middleware
 * Ensures user is authenticated before accessing this route
 */
export const middleware = [siweAuthMiddleware];

export default function CreateVotingPollPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">AgaroVote</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Voting Poll</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create Voting Poll</h1>
          <p className="text-muted-foreground">
            Create a new on-chain voting poll. All votes will be securely recorded on the blockchain
            and verified by smart contracts.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-full">
          <CreateVotingPollForm />
        </div>
      </div>
    </>
  );
}
