import { AlertCircle, Check, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { useWalletDisplay } from '~/hooks/use-web3';
import type { GetUserVote } from '~/lib/api/vote/vote.interface';
import { formatDate } from '~/lib/date-utils';
import { infiniteUserVotesQueryOptions } from '~/lib/query-client/vote/queries';

import { useMemo, useState } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { useVoteContext } from './vote-context';

export const VoterListSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voter Address</TableHead>
                <TableHead>Voted At</TableHead>
                <TableHead>Choice</TableHead>
                <TableHead className="text-right">Commited Token</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card Skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const VoterList = () => {
  const { poll } = useVoteContext();
  const { shortenAddress } = useWalletDisplay();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Fetch voters using infinite query
  const {
    data: voters,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(infiniteUserVotesQueryOptions({ pollId: poll.id, limit: 10 }));

  // Calculate total count from all pages
  const totalVotersCount = useMemo(() => {
    return voters?.length ?? 0;
  }, [voters]);

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const getChoiceText = (choiceId: string) => {
    const choice = poll.choices.find((c) => c.id === choiceId);
    return choice?.choiceText || 'Unknown';
  };

  const handleShowMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <VoterListSkeleton />;
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Voters</CardTitle>
          </div>
          <CardDescription>Unable to load voter information</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="text-destructive" />
              </EmptyMedia>
              <EmptyTitle>Failed to load voters</EmptyTitle>
              <EmptyDescription>
                {error?.message || 'An error occurred while loading the voter list.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Voters</CardTitle>
        </div>
        <CardDescription>
          {totalVotersCount === 0
            ? 'No votes cast yet'
            : `${totalVotersCount} ${totalVotersCount === 1 ? 'vote' : 'votes'} recorded`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalVotersCount === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No votes yet</EmptyTitle>
              <EmptyDescription>
                No votes have been cast yet. Be the first to vote!
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voter Address</TableHead>
                    <TableHead>Voted At</TableHead>
                    <TableHead>Choice</TableHead>
                    <TableHead className="text-right">Committed Token</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters?.map((voter: GetUserVote) => (
                    <TableRow key={voter.id}>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {shortenAddress(voter.voterWalletAddress, 6)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={() => copyToClipboard(voter.voterWalletAddress)}
                            title="Copy address"
                          >
                            {copiedAddress === voter.voterWalletAddress ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(voter.votedAt, 'MMM DD, YYYY HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {voter.choiceName || getChoiceText(voter.choiceId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <code className="text-sm font-mono text-muted-foreground">
                          {voter.commitToken !== null ? voter.commitToken : '-'}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {voters?.map((voter: GetUserVote) => (
                <div
                  key={voter.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Voter Address</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono truncate">
                          {shortenAddress(voter.voterWalletAddress, 6)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => copyToClipboard(voter.voterWalletAddress)}
                        >
                          {copiedAddress === voter.voterWalletAddress ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Voted At</p>
                      <p className="text-sm">{formatDate(voter.votedAt, 'MMM DD, YYYY')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(voter.votedAt, 'HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Choice</p>
                      <Badge variant="secondary" className="font-normal">
                        {voter.choiceName || getChoiceText(voter.choiceId)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Commit Token</p>
                      <code className="text-sm font-mono block">
                        {voter.commitToken !== null ? voter.commitToken : '-'}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button */}
            {hasNextPage && (
              <div className="mt-4 flex flex-col items-center gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleShowMore}
                  className="w-full sm:w-auto"
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading more...' : 'Show more'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {totalVotersCount} {totalVotersCount === 1 ? 'voter' : 'voters'} loaded
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
