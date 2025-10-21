/**
 * InvitedAddressesList Component
 *
 * Displays invited wallet addresses for a private poll with infinite scroll
 * Features:
 * - Infinite query with "Load More" button
 * - Scrollable table/card layout (500px max height with custom scrollbar)
 * - Mobile-responsive table/card layout
 * - Debounced search functionality (500ms delay)
 * - Non-blocking input (remains interactive during loading)
 * - Loading and error states
 * - Empty state handling
 */
import { Loader2, Search, UserCheck, Users } from 'lucide-react';
import { useDebounce } from 'rooks';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { SortOrder } from '~/lib/api/api.interface';
import { InvitedAddressSortBy } from '~/lib/api/poll/invited-address.interface';
import { infiniteInvitedAddressesQueryOptions } from '~/lib/query-client/poll/invited-address-queries';

import { useState } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { useVoteContext } from './vote-context';

export function InvitedAddressesList() {
  const { poll } = useVoteContext();

  // Local state for immediate input updates (not blocked by loading)
  const [searchInput, setSearchInput] = useState('');

  // Debounced search query that triggers API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search input to avoid excessive API calls (500ms delay)
  const debouncedSetSearch = useDebounce((value: string) => {
    setDebouncedSearchQuery(value);
  }, 500);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      infiniteInvitedAddressesQueryOptions(poll.id, {
        limit: 10,
        sortBy: InvitedAddressSortBy.CREATED_AT,
        order: SortOrder.ASC,
        q: debouncedSearchQuery || undefined,
      })
    );

  // Flatten all pages
  const addresses = data?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];
  const totalAddresses = data?.pages[0]?.data?.meta?.total ?? 0;

  if (isLoading) {
    return <InvitedAddressesListSkeleton />;
  }

  if (isError) {
    return <InvitedAddressesListError error={error} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Invited Addresses
            </CardTitle>
            <CardDescription>
              {totalAddresses} wallet{totalAddresses !== 1 ? 's' : ''} allowed to vote
            </CardDescription>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by wallet address..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {addresses.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserCheck />
              </EmptyMedia>
              <EmptyTitle>No addresses found</EmptyTitle>
              <EmptyDescription>
                {debouncedSearchQuery
                  ? 'Try adjusting your search query'
                  : 'No wallet addresses have been added yet'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <ScrollArea className="h-[500px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">#</TableHead>
                      <TableHead>Wallet Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addresses.map((address, index) => (
                      <TableRow key={address.id}>
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{address.walletAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                  {addresses.map((address, index) => (
                    <div
                      key={address.id}
                      className="flex items-center gap-3 rounded-lg border p-3 bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                        <p className="font-mono text-sm truncate">{address.walletAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="gap-2"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load More</>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for invited addresses list
 */
export function InvitedAddressesListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </CardHeader>

      <CardContent>
        {/* Desktop skeleton */}
        <div className="hidden md:block space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error state for invited addresses list
 */
function InvitedAddressesListError({ error }: { error: Error }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-destructive" />
          Invited Addresses
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserCheck className="text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Failed to load addresses</EmptyTitle>
            <EmptyDescription>
              {error?.message || 'An error occurred while loading invited addresses'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}
