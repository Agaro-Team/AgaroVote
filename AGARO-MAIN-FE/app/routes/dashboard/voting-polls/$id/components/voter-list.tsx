import { Check, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Empty,
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
import { formatDate } from '~/lib/date-utils';

import { useEffect, useState } from 'react';

import { useVoteContext } from './vote-context';

interface Voter {
  id: string;
  voterWalletAddress: string;
  votedAt: string;
  choiceId: string;
  isVerified: boolean;
  commitToken: number | null;
}

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
  const [displayCount, setDisplayCount] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace this with actual API call when available
  const allVoters: Voter[] = [
    {
      id: '1',
      voterWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      votedAt: new Date().toISOString(),
      choiceId: poll.choices[0]?.id || '',
      isVerified: true,
      commitToken: 12345,
    },
    {
      id: '2',
      voterWalletAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      votedAt: new Date(Date.now() - 86400000).toISOString(),
      choiceId: poll.choices[1]?.id || '',
      isVerified: true,
      commitToken: 67890,
    },
    {
      id: '3',
      voterWalletAddress: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      votedAt: new Date(Date.now() - 172800000).toISOString(),
      choiceId: poll.choices[0]?.id || '',
      isVerified: false,
      commitToken: null,
    },
    {
      id: '4',
      voterWalletAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      votedAt: new Date(Date.now() - 259200000).toISOString(),
      choiceId: poll.choices[1]?.id || '',
      isVerified: true,
      commitToken: 24680,
    },
    {
      id: '5',
      voterWalletAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      votedAt: new Date(Date.now() - 345600000).toISOString(),
      choiceId: poll.choices[0]?.id || '',
      isVerified: true,
      commitToken: 13579,
    },
    {
      id: '6',
      voterWalletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      votedAt: new Date(Date.now() - 432000000).toISOString(),
      choiceId: poll.choices[1]?.id || '',
      isVerified: true,
      commitToken: 98765,
    },
    {
      id: '7',
      voterWalletAddress: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      votedAt: new Date(Date.now() - 518400000).toISOString(),
      choiceId: poll.choices[0]?.id || '',
      isVerified: false,
      commitToken: null,
    },
    {
      id: '8',
      voterWalletAddress: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      votedAt: new Date(Date.now() - 604800000).toISOString(),
      choiceId: poll.choices[1]?.id || '',
      isVerified: true,
      commitToken: 54321,
    },
  ];

  const voters = allVoters.slice(0, displayCount);
  const hasMore = displayCount < allVoters.length;
  const remainingCount = allVoters.length - displayCount;

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
    setDisplayCount((prev) => Math.min(prev + 5, allVoters.length));
  };

  // Simulate loading - replace with actual API loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <VoterListSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Voters</CardTitle>
        </div>
        <CardDescription>
          {allVoters.length === 0
            ? 'No votes cast yet'
            : `${allVoters.length} ${allVoters.length === 1 ? 'vote' : 'votes'} recorded`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allVoters.length === 0 ? (
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
                    <TableHead className="text-right">Commited Token</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters.map((voter) => (
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
                          {getChoiceText(voter.choiceId)}
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
              {voters.map((voter) => (
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
                        {getChoiceText(voter.choiceId)}
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
            {hasMore && (
              <div className="mt-4 flex flex-col items-center gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleShowMore} className="w-full sm:w-auto">
                  Show more ({remainingCount} remaining)
                </Button>
                <p className="text-xs text-muted-foreground">
                  Showing {voters.length} of {allVoters.length} voters
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
