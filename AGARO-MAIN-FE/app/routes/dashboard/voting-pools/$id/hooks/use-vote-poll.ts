import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWeb3Chain } from '~/hooks/use-web3';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useWatchEntryPointVoteSucceededEvent,
  useWriteEntryPointVote,
} from '~/lib/web3/contracts/generated';

export function useVotePoll() {
  const { chainId } = useWeb3Chain();

  const {
    writeContract,
    data: voteTxHash,
    isPending: isWritingEntryPointVote,
  } = useWriteEntryPointVote({
    mutation: {
      onSuccess: () => {
        console.log('Transaction confirmed');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  });

  // Wait for transaction confirmation
  const { isLoading: isTransactionReceiptLoading, isSuccess: isTransactionReceiptSuccess } =
    useWaitForTransactionReceipt({
      hash: voteTxHash,
    });

  useWatchEntryPointVoteSucceededEvent({
    address: getEntryPointAddress(chainId),
    enabled: isTransactionReceiptSuccess,
    onError: (error) => {
      console.log('error', error);
      toast.error(error.message);
    },
    onLogs: (logs) => {
      logs.forEach((log) => {
        console.log('log', log);
      });
    },
  });

  const vote = (poolHash: `0x${string}`, candidateSelected: number) => {
    const address = getEntryPointAddress(chainId);
    if (!address) {
      toast.error('EntryPoint contract not deployed on this network');
      return;
    }

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

  return {
    vote,
    isTransactionReceiptLoading,
    isTransactionReceiptSuccess,
    isWritingEntryPointVote,
    voteTxHash,
  };
}
