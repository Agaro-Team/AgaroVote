import { toast } from 'sonner';
import { formatEther } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '~/components/ui/button';
import { ClientDate } from '~/components/ui/client-date';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Spinner } from '~/components/ui/spinner';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';
import type { Reward } from '~/lib/api/reward/reward.interface';
import { queryClient } from '~/lib/query-client/config';
import { rewardQueryKeys } from '~/lib/query-client/reward/queries';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';
import {
  useReadSyntheticRewardEarned,
  useWatchEntryPointWithdrawSucceededEvent,
  useWriteEntryPointWithdraw,
} from '~/lib/web3/contracts/generated';
import { parseWagmiErrorForToast } from '~/lib/web3/error-parser';

import { useEffect, useState } from 'react';

export const ClaimRewardConfirmationModal = ({
  children,
  reward,
}: {
  children: React.ReactNode;
  reward: Reward;
}) => {
  const [openModal, setOpenModal] = useState(false);
  const { address: accountAddress } = useWeb3Wallet();
  const { chainId } = useWeb3Chain();
  const { data: rewardEarned, isLoading: isLoadingRewardEarned } = useReadSyntheticRewardEarned({
    address: reward.synthetic_reward_contract_address as `0x${string}`,
    args: [accountAddress as `0x${string}`],
  });

  const {
    writeContract: writeEntryPointWithdrawContract,
    data: txHash,
    isPending: isWritingEntryPointWithdraw,
  } = useWriteEntryPointWithdraw({
    mutation: {
      onError: (error) => {
        const { title, description } = parseWagmiErrorForToast(error);
        toast.error(title, { description });
      },
    },
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
    query: {
      enabled: !!txHash,
    },
  });

  useWatchEntryPointWithdrawSucceededEvent({
    address: getEntryPointAddress(chainId) as `0x${string}`,
    onLogs: (logs) => {
      console.log(logs);
    },
  });

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Reward claimed successfully');
      setOpenModal(false);

      queryClient.invalidateQueries({
        queryKey: rewardQueryKeys.all,
      });
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (confirmError) {
      const { title, description } = parseWagmiErrorForToast(confirmError);
      toast.error(title, { description });
    }
  }, [confirmError]);

  const handleWithdraw = () => {
    if (!chainId) {
      toast.error('Chain not found');
      return;
    }

    if (!reward.poll_hash) {
      toast.error('Poll Hash not found');
      return;
    }

    writeEntryPointWithdrawContract({
      address: getEntryPointAddress(chainId) as `0x${string}`,
      args: [reward.poll_hash],
    });
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Reward</DialogTitle>
          <DialogDescription>Are you sure you want to claim this reward?</DialogDescription>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Poll:</span>
              <span className="font-medium">{reward.poll_title}</span>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reward:</span>
              <span className="font-medium">
                {isLoadingRewardEarned
                  ? 'Loading...'
                  : rewardEarned
                    ? Number(formatEther(rewardEarned)).toFixed(4)
                    : '0'}{' '}
                AGR
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Claimable At:</span>
              <span className="font-medium">
                <ClientDate
                  date={new Date(reward.claimable_at)}
                  formatString="MMM dd, yyyy HH:mm"
                />
              </span>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isWritingEntryPointWithdraw || isConfirming}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            type="submit"
            onClick={handleWithdraw}
            disabled={isWritingEntryPointWithdraw || isConfirming}
          >
            {isWritingEntryPointWithdraw || (isConfirming && <Spinner />)}
            {isWritingEntryPointWithdraw || isConfirming ? 'Confirming...' : 'Claim Reward'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
