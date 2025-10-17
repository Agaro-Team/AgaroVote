/**
 * Vote Page Layout - Header with breadcrumbs and content wrapper
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
import { Spinner } from '~/components/ui/spinner';

import { useVoteContext } from './vote-context';

interface VotePageLayoutProps {
  children: React.ReactNode;
}

export function VotePageLayout({ children }: VotePageLayoutProps) {
  return (
    <>
      <VotePageHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-4xl">{children}</div>
    </>
  );
}

export function VoteLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Spinner />
      <p className="text-muted-foreground">Loading poll details...</p>
    </div>
  );
}

export function VoteError() {
  const { errorPoll } = useVoteContext();
  if (!errorPoll) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <p className="text-destructive">Failed to load poll details</p>
    </div>
  );
}

function VotePageHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <VotePageBreadcrumbs />
      </div>
    </header>
  );
}

function VotePageBreadcrumbs() {
  return (
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
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard/voting-polls">Voting Polls</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Vote</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
