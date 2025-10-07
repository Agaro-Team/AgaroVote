/**
 * Voting Pools List Component
 *
 * Displays a list of voting pools with loading and empty states.
 */
import { FileQuestion } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';

import { VotingPoolCard } from './voting-pool-card';

// TODO: Replace with actual hook when implemented
function useVotingPools() {
  // Mock data for now
  const mockPools = [
    {
      poolHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      title: 'Best Programming Language 2025',
      description:
        'Vote for your favorite programming language that you think will dominate in 2025',
      choices: ['TypeScript', 'Rust', 'Go', 'Python'],
      totalVotes: 1247,
      status: 'active' as const,
      createdAt: new Date('2024-12-01'),
    },
    {
      poolHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      title: 'Community Project Direction',
      description: 'Help decide the next major feature for our community project',
      choices: ['Mobile App', 'API Improvements', 'UI Redesign'],
      totalVotes: 856,
      status: 'active' as const,
      createdAt: new Date('2024-12-05'),
    },
    {
      poolHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      title: 'DAO Treasury Allocation',
      description: 'Vote on how to allocate 100,000 tokens from the treasury',
      choices: ['Development', 'Marketing', 'Community Rewards', 'Reserve'],
      totalVotes: 2341,
      status: 'completed' as const,
      createdAt: new Date('2024-11-20'),
    },
  ];

  return {
    pools: mockPools,
    isLoading: false,
    isError: false,
  };
}

export function VotingPoolsList() {
  const { pools, isLoading, isError } = useVotingPools();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4 p-6 rounded-lg border">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Failed to load voting pools</h3>
        <p className="text-sm text-muted-foreground">
          There was an error loading the voting pools. Please try again.
        </p>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No voting pools found</h3>
        <p className="text-sm text-muted-foreground">
          Be the first to create a voting pool and start voting!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pools.map((pool) => (
        <VotingPoolCard key={pool.poolHash} {...pool} />
      ))}
    </div>
  );
}
