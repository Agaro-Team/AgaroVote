/**
 * Wallet Demo Page
 *
 * Demonstrates all Web3 wallet connection features
 */
import { ChainSwitcher } from '~/components/chain-switcher';
import { WalletConnectButton } from '~/components/wallet-connect-button';
import { WalletInfoCard } from '~/components/wallet-info-card';
import { useWeb3Wallet } from '~/hooks/use-web3';

export default function WalletPage() {
  const { isConnected } = useWeb3Wallet();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Web3 Wallet Connection</h1>
        <p className="text-lg text-muted-foreground">
          Connect your wallet to interact with AgaroVote's decentralized voting system
        </p>
      </div>

      {/* Connection Controls */}
      <div className="flex flex-wrap gap-4">
        <WalletConnectButton />
        {isConnected && <ChainSwitcher />}
      </div>

      {/* Wallet Information */}
      {isConnected && (
        <div className="grid gap-6 md:grid-cols-2">
          <WalletInfoCard />

          {/* Feature Showcase */}
          <div className="space-y-4">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Available Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  View wallet address and balance
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Switch between networks
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Copy address to clipboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  View on blockchain explorer
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Multiple wallet support (MetaMask, WalletConnect, Coinbase)
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-6 bg-muted/50">
              <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
              <p className="text-sm text-muted-foreground">Once connected, you'll be able to:</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Participate in voting proposals</li>
                <li>• Create new voting pools</li>
                <li>• Earn staking rewards</li>
                <li>• View your voting history</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started Guide */}
      {!isConnected && (
        <div className="border rounded-lg p-8 bg-muted/30">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Install a Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Download MetaMask, Coinbase Wallet, or any Web3 wallet extension for your browser
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Click the "Connect Wallet" button above and select your preferred wallet
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Start Voting</h3>
              <p className="text-sm text-muted-foreground">
                Browse active proposals and cast your vote securely on the blockchain
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documentation Link */}
      <div className="border-t pt-8">
        <p className="text-sm text-muted-foreground">
          Need help? Check out the{' '}
          <a href="/docs/WEB3_SETUP.md" className="text-primary underline">
            Web3 Setup Documentation
          </a>
        </p>
      </div>
    </div>
  );
}
