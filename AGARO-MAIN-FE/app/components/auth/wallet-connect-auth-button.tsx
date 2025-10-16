/**
 * Authenticated Wallet Connect Button
 *
 * Extends wallet connection with automatic SIWE authentication
 * After wallet connects, automatically triggers sign-in flow
 */
import { AlertCircle, CheckCircle2, Copy, LogOut, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { parseAuthError, signInWithEthereum } from '~/lib/auth/siwe-client';

import { useEffect, useState } from 'react';

export function WalletConnectAuthButton() {
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();
  const navigate = useNavigate();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-authenticate after wallet connection
  useEffect(() => {
    if (isConnected && address && walletClient && chain && !isAuthenticating && !hasAttemptedAuth) {
      handleAuth();
    }
  }, [isConnected, address, walletClient, chain]);

  const handleAuth = async () => {
    if (!address || !walletClient || !chain) return;

    setIsAuthenticating(true);
    setAuthError(null);
    setHasAttemptedAuth(true);

    try {
      await signInWithEthereum(address, walletClient, chain.id);
      // Redirect happens in signInWithEthereum
    } catch (error) {
      const errorMessage = parseAuthError(error);
      setAuthError(errorMessage);
      console.error('Authentication failed:', error);

      // Disconnect wallet on auth failure
      setTimeout(() => {
        disconnect();
        setHasAttemptedAuth(false);
      }, 3000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    disconnect();
    setHasAttemptedAuth(false);
    setAuthError(null);

    // Sign out and redirect
    try {
      await fetch('/auth/signout', { method: 'POST' });
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
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

  // Show auth error
  if (authError) {
    return (
      <Button variant="destructive" disabled className="gap-2">
        <AlertCircle className="h-4 w-4" />
        {authError}
      </Button>
    );
  }

  // Connected and authenticated - show wallet menu
  if (isConnected && address) {
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
