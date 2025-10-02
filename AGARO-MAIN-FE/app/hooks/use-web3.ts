/**
 * Custom Web3 Hooks
 *
 * Simplified hooks that wrap wagmi hooks for easier usage across the application.
 * These hooks provide wallet connection status, account info, and blockchain interactions.
 */

import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { formatEther } from "viem";

/**
 * useWeb3Wallet Hook
 *
 * Provides wallet connection state and actions
 *
 *
 * @example
 * ```tsx
 * const { address, isConnected, connect, disconnect } = useWeb3Wallet();
 *
 * if (!isConnected) {
 *   return <button onClick={() => connect()}>Connect Wallet</button>;
 * }
 * ```
 */
export function useWeb3Wallet() {
  const { address, isConnected, isConnecting, isDisconnected, chain } =
    useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    // Wallet state
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chain,

    // Actions
    connect: (connectorId?: string) => {
      const connector = connectorId
        ? connectors.find((c) => c.id === connectorId)
        : connectors[0];
      if (connector) {
        connect({ connector });
      }
    },
    disconnect,

    // Available connectors
    connectors,
    isPending,
  };
}

/**
 * useWalletBalance Hook
 *
 * Fetches and formats the wallet balance
 *
 *
 * @example
 * ```tsx
 * const { balance, formattedBalance, isLoading } = useWalletBalance();
 *
 * return <p>Balance: {formattedBalance} ETH</p>;
 * ```
 */
export function useWalletBalance() {
  const { address } = useAccount();
  const { data, isLoading, isError, refetch } = useBalance({
    address,
  });

  return {
    balance: data?.value,
    formattedBalance: data ? formatEther(data.value) : "0.0",
    symbol: data?.symbol || "ETH",
    decimals: data?.decimals || 18,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * useWeb3Chain Hook
 *
 * Provides current chain information and switching capabilities
 *
 *
 * @example
 * ```tsx
 * const { chainId, chainName, switchChain } = useWeb3Chain();
 *
 * return <button onClick={() => switchChain(1)}>Switch to Mainnet</button>;
 * ```
 */
export function useWeb3Chain() {
  const chainId = useChainId();
  const { chains, switchChain, isPending } = useSwitchChain();

  const currentChain = chains.find((c) => c.id === chainId);

  return {
    chainId,
    chainName: currentChain?.name || "Unknown",
    chain: currentChain,
    chains,
    switchChain,
    isSwitching: isPending,
  };
}

/**
 * useWalletDisplay Hook
 *
 * Utilities for displaying wallet information
 *
 *
 * @example
 * ```tsx
 * const { shortenAddress } = useWalletDisplay();
 *
 * return <p>{shortenAddress(address)}</p>; // "0x1234...5678"
 * ```
 */
export function useWalletDisplay() {
  /**
   * Shortens an Ethereum address for display
   * @param address - The full Ethereum address
   * @param chars - Number of characters to show on each side (default: 4)
   */
  const shortenAddress = (address?: string, chars = 4): string => {
    if (!address) return "";
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
  };

  /**
   * Formats a chain name for display
   * @param chainId - The chain ID
   */
  const getChainDisplayName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: "Ethereum",
      5: "Goerli",
      11155111: "Sepolia",
      137: "Polygon",
      80002: "Polygon Amoy",
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  return {
    shortenAddress,
    getChainDisplayName,
  };
}
