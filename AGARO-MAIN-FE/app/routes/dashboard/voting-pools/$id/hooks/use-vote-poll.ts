import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain } from '~/hooks/use-web3';
import { useWeb3Wallet } from '~/hooks/use-web3';
import { castVoteMutationOptions } from '~/lib/query-client/vote/mutations';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useWatchEntryPointVoteSucceededEvent,
  useWriteEntryPointVote,
} from '~/lib/web3/contracts/generated';

import { useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

interface VoteParams {
  poolId: string;
  poolHash: `0x${string}`;
  candidateSelected: number;
  choiceId: string;
}

interface LogArgs {
  poolHash?: `0x${string}`;
  voter?: `0x${string}`;
  selected?: number;
  newPoolVoterHash?: `0x${string}`;
}

export function useVotePoll() {
  const { chainId } = useWeb3Chain();
  const { address: walletAddress } = useWeb3Wallet();

  const [log, setLog] = useState<LogArgs | null>(null);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const [hasSubmittedToBackend, setHasSubmittedToBackend] = useState(false);

  const castVoteMutation = useMutation({
    ...castVoteMutationOptions,
    onSuccess: () => {
      toast.success('Vote successfully recorded!');
      // Reset states after successful submission
      setLog(null);
      setPoolId(null);
      setChoiceId(null);
      setHasSubmittedToBackend(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to record vote: ${error.message}`);
      setHasSubmittedToBackend(false);
    },
  });

  const {
    writeContract,
    data: voteTxHash,
    isPending: isWritingEntryPointVote,
    error: writeError,
    reset: resetWrite,
  } = useWriteEntryPointVote({
    mutation: {
      onSuccess: () => {
        toast.success('Transaction submitted to blockchain');
      },
      onError: (error) => {
        toast.error(`Transaction failed: ${error.message}`);
        // Reset local states on transaction error
        setPoolId(null);
        setChoiceId(null);
      },
    },
  });

  // Wait for transaction confirmation
  const {
    isLoading: isTransactionReceiptLoading,
    isSuccess: isTransactionReceiptSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: voteTxHash,
  });

  // Handle receipt error
  useEffect(() => {
    if (receiptError) {
      toast.error(`Transaction receipt error: ${receiptError.message}`);
      setPoolId(null);
      setChoiceId(null);
      setLog(null);
    }
  }, [receiptError]);

  useWatchEntryPointVoteSucceededEvent({
    address: getEntryPointAddress(chainId),
    enabled: isTransactionReceiptSuccess && !hasSubmittedToBackend,
    onError: (error) => {
      toast.error(`Event watch error: ${error.message}`);
      setPoolId(null);
      setChoiceId(null);
      setLog(null);
    },
    onLogs: (logs) => {
      if (logs.length === 0) return;

      // Only set the log on the last log
      const lastLog = logs[logs.length - 1];
      if (lastLog.args) {
        setLog(lastLog.args);
      }
    },
  });

  const vote = ({ poolHash, candidateSelected, choiceId, poolId }: VoteParams) => {
    const address = getEntryPointAddress(chainId);

    if (!address) {
      toast.error('EntryPoint contract not deployed on this network');
      return;
    }

    if (!choiceId) {
      toast.error('Choice ID is required');
      return;
    }

    setChoiceId(choiceId);
    setPoolId(poolId);

    const args = {
      poolHash,
      candidateSelected,
      proofs: [], // Empty for now
    };

    writeContract({
      address,
      args: [args],
    });
  };

  useEffect(() => {
    // Prevent duplicate submissions
    if (hasSubmittedToBackend || castVoteMutation.isPending) {
      return;
    }

    // Validate all required data is present
    if (!log || !log.poolHash || !log.voter || !walletAddress) {
      return;
    }

    if (!choiceId || !poolId || !voteTxHash || !isTransactionReceiptSuccess) {
      return;
    }

    // Verify the voter matches the wallet
    if (log.voter.toLowerCase() !== walletAddress.toLowerCase()) {
      toast.error('Voter address mismatch');
      return;
    }

    // Submit to backend
    setHasSubmittedToBackend(true);
    castVoteMutation.mutate({
      pollId: poolId,
      choiceId,
      voterWalletAddress: walletAddress,
      transactionHash: voteTxHash,
    });
  }, [
    isTransactionReceiptSuccess,
    poolId,
    choiceId,
    voteTxHash,
    log,
    walletAddress,
    hasSubmittedToBackend,
    castVoteMutation,
  ]);

  return {
    vote,
    isTransactionReceiptLoading,
    isTransactionReceiptSuccess,
    isWritingEntryPointVote,
    voteTxHash,
    isSubmittingToBackend: castVoteMutation.isPending,
    backendError: castVoteMutation.error,
    writeError,
    receiptError,
    resetWrite,
    choiceId,
    choiceIndex,
    poolId,
    setChoiceIndex,
    setPoolId,
    setChoiceId,
  };
}
