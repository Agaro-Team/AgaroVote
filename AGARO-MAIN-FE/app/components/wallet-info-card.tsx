/**
 * Wallet Info Card Component
 *
 * Displays comprehensive wallet information including address, balance, and network.
 * Useful for dashboard or profile pages.
 */

import {
  useWeb3Wallet,
  useWalletBalance,
  useWeb3Chain,
  useWalletDisplay,
} from "~/hooks/use-web3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { useState } from "react";

/**
 * WalletInfoCard Component
 *
 * @example
 * ```tsx
 * <WalletInfoCard />
 * ```
 */
export function WalletInfoCard() {
  const { address, isConnected } = useWeb3Wallet();
  const {
    formattedBalance,
    symbol,
    isLoading: isLoadingBalance,
  } = useWalletBalance();
  const { chainName, chainId } = useWeb3Chain();
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

  // Open blockchain explorer
  const openExplorer = () => {
    if (!address) return;

    const explorerUrls: Record<number, string> = {
      1: "https://etherscan.io/address",
      5: "https://goerli.etherscan.io/address",
      11155111: "https://sepolia.etherscan.io/address",
      137: "https://polygonscan.com/address",
      80002: "https://amoy.polygonscan.com/address",
    };

    const baseUrl = explorerUrls[chainId] || "https://etherscan.io/address";
    window.open(`${baseUrl}/${address}`, "_blank");
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Not Connected</CardTitle>
          <CardDescription>
            Connect your wallet to view your account information
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Information</CardTitle>
        <CardDescription>Your connected wallet details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Address</p>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-muted px-3 py-1.5 rounded flex-1">
              {shortenAddress(address, 6)}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyAddress}
              title="Copy address"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={openExplorer}
              title="View on explorer"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Balance</p>
          {isLoadingBalance ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-2xl font-bold">
              {parseFloat(formattedBalance).toFixed(4)} {symbol}
            </p>
          )}
        </div>

        {/* Network Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Network</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-sm font-medium">{chainName}</p>
            <span className="text-xs text-muted-foreground">({chainId})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
