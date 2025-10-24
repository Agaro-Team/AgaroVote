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
import { Spinner } from '~/components/ui/spinner';
import { cn } from '~/lib/utils';

import type React from 'react';

import { useVoteContext } from './vote-context';

interface VotePageLayoutProps {
  children: React.ReactNode;
}

export function VotePageLayout({ children }: VotePageLayoutProps) {
  return <div className="flex flex-1 flex-col gap-10 p-4 pt-0 ">{children}</div>;
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

type VoteGridProps = React.ComponentProps<'div'>;
export const VoteGrid = ({ children, className, ...props }: VoteGridProps) => {
  return (
    <div
      className={cn('grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8', className)}
      {...props}
    >
      {children}
    </div>
  );
};

type VoteGridItemProps = React.ComponentProps<'div'>;

export const VoteGridItem = ({ children, className, ...props }: VoteGridItemProps) => {
  return (
    <div className={cn('col-span-1 space-y-8', className)} {...props}>
      {children}
    </div>
  );
};
