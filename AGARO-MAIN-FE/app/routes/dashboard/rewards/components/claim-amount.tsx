import { formatEther } from 'viem';
import CountUp from '~/components/CountUp';
import { Spinner } from '~/components/ui/spinner';
import { useWalletBalance, useWeb3Wallet } from '~/hooks/use-web3';
import type { Reward } from '~/lib/api/reward/reward.interface';
import { cn } from '~/lib/utils';
import { useReadSyntheticRewardEarned } from '~/lib/web3/contracts/generated';

import type React from 'react';

type ClaimAmountProps = React.ComponentProps<'p'> & {
  reward: Reward;
};

export const ClaimAmount = ({ reward, className, ...props }: ClaimAmountProps) => {
  const { address: accountAddress } = useWeb3Wallet();
  const { data: rewardEarned, isLoading: isLoadingRewardEarned } = useReadSyntheticRewardEarned({
    address: reward.synthetic_reward_contract_address as `0x${string}`,
    args: [accountAddress as `0x${string}`],
    query: {
      refetchInterval: 5000,
      refetchOnMount: true,
    },
  });

  const rewardAmount = rewardEarned ? Number(formatEther(rewardEarned)) : 0;

  return (
    <p {...props} className={cn('text-2xl font-bold', className)}>
      {isLoadingRewardEarned ? (
        <Spinner size="sm" />
      ) : (
        <>
          <CountUp
            to={Number(rewardAmount.toFixed(4))}
            from={0}
            direction="up"
            duration={0.5}
            className={cn('inline-block', className)}
            startWhen={!isLoadingRewardEarned}
          />
        </>
      )}{' '}
      AGR
    </p>
  );
};

export const ClaimedAmount = ({ reward, className, ...props }: ClaimAmountProps) => {
  const { symbol } = useWalletBalance();

  const rewardAmount = Number(formatEther(BigInt(reward.reward_amount)));

  return (
    <p {...props} className={cn('text-2xl font-bold', className)}>
      <CountUp
        to={Number(rewardAmount.toFixed(4))}
        from={0}
        direction="up"
        duration={0.5}
        className={cn('inline-block', className)}
      />
      {symbol}
    </p>
  );
};
