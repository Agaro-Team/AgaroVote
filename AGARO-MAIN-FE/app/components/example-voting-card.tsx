/**
 * Example Voting Card Component
 *
 * Complete example component showing how to interact with a smart contract.
 * This demonstrates:
 * - Reading contract data (view functions)
 * - Writing to contracts (transactions)
 * - Loading states
 * - Error handling
 * - Transaction feedback
 *
 * USAGE:
 * ```tsx
 * import { ExampleVotingCard } from '~/components/example-voting-card';
 *
 * <ExampleVotingCard proposalId={1} />
 * ```
 */
import { CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react';
import {
  useHasVoted,
  useProposal,
  useSubmitVote,
  useWatchVoteEvents,
} from '~/hooks/use-example-voting-contract';
import { useWalletDisplay, useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';

import { useEffect, useState } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface ExampleVotingCardProps {
  proposalId: number;
}

export function ExampleVotingCard({ proposalId }: ExampleVotingCardProps) {
  const { isConnected, address } = useWeb3Wallet();
  const { chainId } = useWeb3Chain();
  const { shortenAddress } = useWalletDisplay();

  // Read contract data
  const {
    proposal,
    isLoading: loadingProposal,
    refetch: refetchProposal,
  } = useProposal(proposalId);
  const { hasVoted, refetch: refetchHasVoted } = useHasVoted();

  // Write to contract
  const { vote, isPending, isConfirming, isSuccess, isError, error, txHash } = useSubmitVote();

  // Watch for vote events and refresh data
  useWatchVoteEvents((voter, votedProposalId) => {
    if (Number(votedProposalId) === proposalId) {
      refetchProposal();
      if (voter === address) {
        refetchHasVoted();
      }
    }
  });

  // Refetch when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      refetchProposal();
      refetchHasVoted();
    }
  }, [isSuccess, refetchProposal, refetchHasVoted]);

  // Get block explorer URL
  const getExplorerUrl = () => {
    const explorerUrls: Record<number, string> = {
      1: 'https://etherscan.io/tx',
      11155111: 'https://sepolia.etherscan.io/tx',
      137: 'https://polygonscan.com/tx',
      80002: 'https://amoy.polygonscan.com/tx',
    };
    return explorerUrls[chainId] || 'https://etherscan.io/tx';
  };

  // Handle vote click
  const handleVote = () => {
    vote(proposalId);
  };

  // Wallet not connected state
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proposal #{proposalId}</CardTitle>
          <CardDescription>Connect your wallet to view and vote on this proposal</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Loading state
  if (loadingProposal) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Proposal not found
  if (!proposal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proposal Not Found</CardTitle>
          <CardDescription>Proposal #{proposalId} could not be loaded</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{proposal.title}</CardTitle>
            <CardDescription>Proposal #{proposalId}</CardDescription>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              proposal.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
            }`}
          >
            {proposal.isActive ? '🟢 Active' : '🔴 Closed'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vote Count */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium text-muted-foreground">Current Votes</p>
          <p className="text-3xl font-bold">{proposal.voteCount}</p>
        </div>

        {/* Voting Status */}
        {hasVoted && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              You have already voted on this proposal
            </p>
          </div>
        )}

        {/* Vote Button */}
        <Button
          onClick={handleVote}
          disabled={!proposal.isActive || hasVoted || isPending || isConfirming}
          className="w-full"
          size="lg"
        >
          {isPending && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing transaction...
            </>
          )}
          {isConfirming && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming transaction...
            </>
          )}
          {!isPending && !isConfirming && (
            <>{hasVoted ? 'Already Voted' : proposal.isActive ? 'Submit Vote' : 'Voting Closed'}</>
          )}
        </Button>

        {/* Success Message */}
        {isSuccess && (
          <div className="space-y-2 rounded-lg bg-green-100 p-4 dark:bg-green-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300" />
              <p className="font-medium text-green-900 dark:text-green-100">
                Vote submitted successfully!
              </p>
            </div>
            {txHash && (
              <a
                href={`${getExplorerUrl()}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
              >
                View transaction
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Error Message */}
        {isError && (
          <div className="space-y-2 rounded-lg bg-red-100 p-4 dark:bg-red-900">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-300" />
              <p className="font-medium text-red-900 dark:text-red-100">Failed to submit vote</p>
            </div>
            {error && (
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message || 'An error occurred while submitting your vote'}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
        <span>Connected: {shortenAddress(address)}</span>
        <span>Chain ID: {chainId}</span>
      </CardFooter>
    </Card>
  );
}

/**
 * Compact version for list views
 */
export function ExampleVotingCardCompact({ proposalId }: ExampleVotingCardProps) {
  const { isConnected } = useWeb3Wallet();
  const { proposal, isLoading } = useProposal(proposalId);
  const { hasVoted } = useHasVoted();
  const { vote, isPending, isConfirming } = useSubmitVote();

  if (!isConnected || isLoading || !proposal) {
    return null;
  }

  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex-1">
        <h3 className="font-semibold">{proposal.title}</h3>
        <p className="text-sm text-muted-foreground">{proposal.voteCount} votes</p>
      </div>
      <Button
        onClick={() => vote(proposalId)}
        disabled={!proposal.isActive || hasVoted || isPending || isConfirming}
        size="sm"
      >
        {isPending || isConfirming ? 'Voting...' : hasVoted ? 'Voted' : 'Vote'}
      </Button>
    </Card>
  );
}
