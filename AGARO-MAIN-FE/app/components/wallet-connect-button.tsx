/**
 * Wallet Connect Button Component
 *
 * A button that shows wallet connection status and allows users to connect/disconnect.
 * Displays address when connected, shows connect button when disconnected.
 */

import { useWeb3Wallet, useWalletDisplay } from "~/hooks/use-web3";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Wallet, LogOut, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface WalletConnectButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * WalletConnectButton Component
 *
 * @example
 * ```tsx
 * <WalletConnectButton />
 * <WalletConnectButton variant="outline" size="sm" />
 * ```
 */
export function WalletConnectButton({
  variant = "default",
  size = "default",
}: WalletConnectButtonProps) {
  const { address, isConnected, connect, disconnect, connectors, isPending } =
    useWeb3Wallet();
  const { shortenAddress } = useWalletDisplay();
  const [copied, setCopied] = useState(false);

  // Handle copy address to clipboard
  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Not connected - show connect button with connector options
  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={isPending}>
            <Wallet className="h-4 w-4 mr-2" />
            {isPending ? "Connecting..." : "Connect Wallet"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Choose Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => connect(connector.id)}
              className="cursor-pointer"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {connector.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Connected - show address with dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Wallet className="h-4 w-4 mr-2" />
          {shortenAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCopyAddress}
          className="cursor-pointer"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Address
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
