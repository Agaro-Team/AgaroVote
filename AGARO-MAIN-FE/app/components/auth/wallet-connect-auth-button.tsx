/**
 * Authenticated Wallet Connect Button
 *
 * Simplified wallet connection button that leverages AuthContext
 * for all authentication state and logic.
 */
import { AlertCircle, CheckCircle2, Copy, LayoutDashboard, LogOut, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useAuth } from '~/lib/auth';

import { useState } from 'react';

export function WalletConnectAuthButton() {
  // Wallet state from wagmi
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();

  // Auth state from AuthContext - single source of truth
  const { isAuthenticated, isAuthenticating, error: authError, authenticate, signOut } = useAuth();

  // Navigation
  const navigate = useNavigate();

  // Local UI state only
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    // Disconnect wallet first
    disconnect();
    // Sign out from AuthContext (handles cookie clearing and redirect)
    await signOut();
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Show authenticating state
  if (isAuthenticating) {
    return (
      <Button disabled className="gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Authenticating...
      </Button>
    );
  }

  // Show auth error (AuthContext handles toast, but we can show in button too)
  if (authError && isConnected && !isAuthenticated) {
    return (
      <Button onClick={authenticate} variant="destructive" className="gap-2" title={authError}>
        <AlertCircle className="h-4 w-4" />
        Retry Authentication
      </Button>
    );
  }

  // Connected but not authenticated - show sign in button
  if (isConnected && address && !isAuthenticated) {
    return (
      <Button onClick={authenticate} className="gap-2" variant="default">
        <Wallet className="h-4 w-4" />
        Sign In with Ethereum
      </Button>
    );
  }

  // Connected and authenticated - show wallet menu
  if (isConnected && address && isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {shortenAddress(address)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer font-medium"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Address
              </>
            )}
          </DropdownMenuItem>
          {chain && (
            <DropdownMenuItem disabled>
              <span className="mr-2">🔗</span>
              {chain.name}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Not connected - show connect options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.id}
            onClick={() => connect({ connector })}
            className="cursor-pointer"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {connector.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
