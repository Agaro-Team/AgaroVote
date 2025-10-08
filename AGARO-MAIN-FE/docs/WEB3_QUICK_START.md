# Web3 Quick Start Guide

**Get your wallet connection up and running in 5 minutes!**

---

## ⚡ Quick Setup

### 1. Environment Configuration

Create a `.env` file:

```bash
# Smart Contract Addresses (Required)
VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET=0x...
VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA=0x...
VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT=0x...

# Optional: WalletConnect (currently not in use)
# VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get WalletConnect Project ID at: https://cloud.walletconnect.com (if enabling)

### 2. Generate Contract Hooks

After compiling your Hardhat contracts:

```bash
yarn wagmi
```

### 3. Test the Connection

Start the dev server:

```bash
yarn dev
```

Navigate to: http://localhost:5173/dashboard

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
- `<CreateVotingPoolForm />` - Create voting pools
- `<VotingPoolCard />` - Display pool info

### ✅ Hooks

**Wallet & Connection:**
- `useWeb3Wallet()` - Wallet connection state
- `useWalletBalance()` - Get wallet balance
- `useWeb3Chain()` - Network information
- `useWalletDisplay()` - Formatting utilities
- `useWaitForTransactionReceiptEffect()` - Transaction confirmation

**Smart Contracts:**
- Auto-generated hooks from `@wagmi/cli` (e.g., `useReadEntryPointVersion`)
- `useCreateVotingPool()` - Create pools with hash verification
- `useVotingPoolHash()` - Compute and verify hashes
- `useOptimisticMutation()` - Optimistic UI updates

### ✅ Configuration

- Default browser wallet support (MetaMask, etc.)
- Multi-chain ready (Ethereum Mainnet, Sepolia, Hardhat Local)
- SSR compatible with cookie storage
- TypeScript typed with auto-generated contract types
- Hash verification system for data integrity

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

### Create Voting Pool

```tsx
import { useCreateVotingPool } from '~/hooks/voting-pools/use-create-voting-pool';

const { createPool, isPending, isConfirming } = useCreateVotingPool();

const handleCreate = () => {
  createPool({
    title: 'Best Framework',
    description: 'Vote for your favorite',
    candidates: ['React', 'Vue', 'Svelte'],
    candidatesTotal: 3,
  });
};

<button onClick={handleCreate} disabled={isPending || isConfirming}>
  {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Create Pool'}
</button>
```

### Read Contract Data

```tsx
import { useReadEntryPointVersion } from '~/lib/web3/contracts/generated';
import { getEntryPointAddress } from '~/lib/web3/contracts/entry-point-config';

const { chainId } = useWeb3Chain();
const { data: version } = useReadEntryPointVersion({
  address: getEntryPointAddress(chainId),
});

return <p>Contract Version: {version?.toString()}</p>;
```

### Network Guard

```tsx
const { chainId, switchChain } = useWeb3Chain();

if (chainId !== 1 && chainId !== 11155111) {
  return (
    <button onClick={() => switchChain({ chainId: 11155111 })}>
      Switch to Sepolia
    </button>
  );
}
```

---

## 🚀 Demo Pages

- `/dashboard` - Main dashboard with wallet integration
- `/dashboard/voting-pools` - View voting pools
- `/dashboard/voting-pools/create` - Create new voting pool
- `/wallet` - Wallet connection demo (if available)

---

## 📚 Full Documentation

For detailed information, see [WEB3_SETUP.md](./WEB3_SETUP.md)
