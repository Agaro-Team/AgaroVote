/**
 * Web3 Configuration
 *
 * This file contains the Web3/Ethereum configuration for the AgaroVote application.
 * It sets up the supported chains and wallet connectors using wagmi and viem.
 */

import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygon, polygonAmoy } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

/**
 * WalletConnect Project ID
 * Get your project ID at https://cloud.walletconnect.com
 */
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

/**
 * Supported blockchain networks
 * Customize this based on your deployment needs
 */
export const supportedChains = [
  mainnet, // Ethereum Mainnet
  sepolia, // Ethereum Sepolia Testnet
  polygon, // Polygon Mainnet
  polygonAmoy, // Polygon Amoy Testnet
] as const;

/**
 * Wagmi Configuration
 * Provides the core Web3 functionality throughout the application
 */
export const config = createConfig({
  chains: supportedChains,
  connectors: [
    // MetaMask, Rainbow, Brave Wallet, etc. (injected wallets)
    injected({
      shimDisconnect: true,
    }),

    // WalletConnect - for mobile wallets
    walletConnect({
      projectId,
      metadata: {
        name: "AgaroVote",
        description: "Decentralized Voting for Everyone",
        url: typeof window !== "undefined" ? window.location.origin : "",
        icons: [
          typeof window !== "undefined"
            ? `${window.location.origin}/favicon.ico`
            : "",
        ],
      },
      showQrModal: true,
    }),

    // Coinbase Wallet
    coinbaseWallet({
      appName: "AgaroVote",
      appLogoUrl:
        typeof window !== "undefined"
          ? `${window.location.origin}/favicon.ico`
          : "",
    }),
  ],

  // Transport configuration for each chain
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },

  // Enable SSR mode for React Router
  ssr: true,
});

/**
 * TypeScript type declarations for the config
 */
declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
