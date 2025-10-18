import { Sparkles } from 'lucide-react';
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
import type { Reward } from '~/lib/api/reward/reward.interface';
import { useReadEntryPointSyntheticRewardImplementation } from '~/lib/web3/contracts/generated';

import React from 'react';

export const ClaimRewardConfirmationModal = ({
  children,
  reward,
}: {
  children: React.ReactNode;
  reward: Reward;
}) => {
  const { data: rewardContract } = useReadEntryPointSyntheticRewardImplementation({
    address: reward.synthetic_reward_contract_address,
    query: {
      enabled: !!reward.synthetic_reward_contract_address,
    },
  });

  console.log({
    rewardContract,
  });

  return (
    <Dialog>
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
              <span className="font-medium">{reward.reward_amount} AGR</span>
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
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button type="submit">
            <Sparkles />
            Claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
