# Web3 Quick Start Guide

**Get your wallet connection up and running in 5 minutes!**

---

## ⚡ Quick Setup

### 1. Environment Configuration

Create a `.env` file:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get your Project ID at: https://cloud.walletconnect.com

### 2. Test the Connection

Start the dev server:

```bash
npm run dev
```

Navigate to: http://localhost:5173/wallet

---

## 🎯 Basic Usage Examples

### Connect Button

```tsx
import { WalletConnectButton } from '~/components/wallet-connect-button';

<WalletConnectButton />;
```

### Check if Connected

```tsx
import { useWeb3Wallet } from '~/hooks/use-web3';

const { address, isConnected } = useWeb3Wallet();
```

### Display Balance

```tsx
import { useWalletBalance } from "~/hooks/use-web3";

const { formattedBalance, symbol } = useWalletBalance();
return <p>{formattedBalance} {symbol}</p>;
```

### Network Switcher

```tsx
import { ChainSwitcher } from '~/components/chain-switcher';

<ChainSwitcher />;
```

---

## 📦 What's Included

### ✅ Components

- `<WalletConnectButton />` - Connect/disconnect wallet
- `<WalletInfoCard />` - Display wallet details
- `<ChainSwitcher />` - Switch networks

### ✅ Hooks

- `useWeb3Wallet()` - Wallet connection state
- `useWalletBalance()` - Get wallet balance
- `useWeb3Chain()` - Network information
- `useWalletDisplay()` - Formatting utilities

### ✅ Configuration

- Multiple wallet support (MetaMask, WalletConnect, Coinbase)
- Multi-chain ready (Ethereum, Polygon, Sepolia, Amoy)
- SSR compatible with React Router
- TypeScript typed

---

## 🎨 Ready-to-Use Patterns

### Protected Route

```tsx
const { isConnected } = useWeb3Wallet();

if (!isConnected) {
  return <Navigate to="/" />;
}

return <ProtectedContent />;
```

### Wallet-Aware Component

```tsx
const { address, isConnected, connect } = useWeb3Wallet();

if (!isConnected) {
  return <button onClick={() => connect()}>Connect</button>;
}

return <p>Welcome {address}</p>;
```

### Network Guard

```tsx
const { chainId, switchChain } = useWeb3Chain();

if (chainId !== 1) {
  return (
    <button onClick={() => switchChain({ chainId: 1 })}>
      Switch to Ethereum
    </button>
  );
}
```

---

## 🚀 Demo Page

Visit `/wallet` route to see all features in action!

---

## 📚 Full Documentation

For detailed information, see [WEB3_SETUP.md](./WEB3_SETUP.md)
