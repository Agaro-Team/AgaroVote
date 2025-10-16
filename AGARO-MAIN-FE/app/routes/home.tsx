/**
 * Home Page - Wallet Connection
 *
 * Main landing page with Web3 wallet connection interface
 */
import { WalletConnectAuthButton } from '~/components/auth/wallet-connect-auth-button';
import { ChainSwitcher } from '~/components/chain-switcher';
import { WalletInfoCard } from '~/components/wallet-info-card';
import { useWeb3Wallet } from '~/hooks/use-web3';

import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'AgaroVote - Decentralized Voting Platform' },
    {
      name: 'description',
      content: 'Connect your wallet to participate in transparent, blockchain-based voting',
    },
  ];
}

export default function Home() {
  const { isConnected } = useWeb3Wallet();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Welcome to AgaroVote</h1>
        <p className="text-lg text-muted-foreground">
          Decentralized Voting for Everyone, From Communities to Nations
        </p>
      </div>

      {/* Connection Controls */}
      <div className="flex flex-wrap justify-center gap-4">
        <WalletConnectAuthButton />
        {isConnected && <ChainSwitcher />}
      </div>

      {/* Wallet Information */}
      {isConnected && (
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
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
        <div className="border rounded-lg p-8 bg-muted/30 max-w-4xl mx-auto">
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

      {/* Key Features */}
      <div className="border-t pt-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Why AgaroVote?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="font-semibold mb-2">Decentralized & Trustless</h3>
            <p className="text-sm text-muted-foreground">
              Powered by blockchain, eliminating third-party verification
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold mb-2">Rewarding Participation</h3>
            <p className="text-sm text-muted-foreground">
              Every vote matters and is incentivized through synthetic staking
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-semibold mb-2">Flexible Voting Models</h3>
            <p className="text-sm text-muted-foreground">
              One-person-one-vote, token-weighted, quadratic, or custom rules
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
