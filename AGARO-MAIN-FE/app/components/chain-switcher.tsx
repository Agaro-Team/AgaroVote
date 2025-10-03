/**
 * Chain Switcher Component
 *
 * Allows users to switch between different blockchain networks.
 * Displays current network and shows available networks in a dropdown.
 */
import { CheckCircle2, Network } from 'lucide-react';
import { useWeb3Chain, useWeb3Wallet } from '~/hooks/use-web3';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ChainSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * ChainSwitcher Component
 *
 * @example
 * ```tsx
 * <ChainSwitcher />
 * <ChainSwitcher variant="outline" size="sm" />
 * ```
 */
export function ChainSwitcher({ variant = 'outline', size = 'default' }: ChainSwitcherProps) {
  const { isConnected } = useWeb3Wallet();
  const { chainId, chainName, chains, switchChain, isSwitching } = useWeb3Chain();

  if (!isConnected) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isSwitching}>
          <Network className="h-4 w-4 mr-2" />
          {isSwitching ? 'Switching...' : chainName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {chains.map((chain) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => switchChain({ chainId: chain.id })}
            className="cursor-pointer"
            disabled={chain.id === chainId}
          >
            <div className="flex items-center justify-between w-full">
              <span>{chain.name}</span>
              {chain.id === chainId && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
