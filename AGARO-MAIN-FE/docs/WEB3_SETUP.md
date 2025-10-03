# Web3 Wallet Connection Setup

This document explains how the Web3 wallet connection infrastructure works in AgaroVote and how to use it.

---

## 📚 Overview

The Web3 infrastructure is built using:

- **[wagmi](https://wagmi.sh/)** v2.17+ - React Hooks for Ethereum
- **[viem](https://viem.sh/)** v2.37+ - TypeScript Interface for Ethereum
- **@tanstack/react-query** - For caching and state management
- **localStorage persistence** - Query data survives page refreshes

---

## 🏗️ Architecture

### Directory Structure

```
app/
├── lib/
│   └── web3/
│       ├── config.ts          # Web3 configuration (chains, connectors)
│       └── provider.tsx       # Web3Provider component
├── hooks/
│   └── use-web3.ts           # Custom Web3 hooks
└── components/
    ├── wallet-connect-button.tsx   # Connect/disconnect wallet button
    ├── wallet-info-card.tsx        # Display wallet information
    └── chain-switcher.tsx          # Network switching component
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the project root:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get your WalletConnect Project ID at: https://cloud.walletconnect.com

### 2. Supported Networks

Currently configured networks (see `app/lib/web3/config.ts`):

- **Ethereum Mainnet** (Chain ID: 1)
- **Sepolia Testnet** (Chain ID: 11155111)
- **Polygon Mainnet** (Chain ID: 137)
- **Polygon Amoy Testnet** (Chain ID: 80002)

To add more networks, edit `supportedChains` in `config.ts`.

### 3. Wallet Connectors

Available wallet connectors:

- **Injected** - MetaMask, Rainbow, Brave Wallet, etc.
- **WalletConnect** - Mobile wallets via QR code
- **Coinbase Wallet** - Coinbase's browser extension/app

---

## 🎯 Usage

### Basic Wallet Connection

```tsx
import { WalletConnectButton } from '~/components/wallet-connect-button';

export default function MyPage() {
  return (
    <div>
      <WalletConnectButton />
    </div>
  );
}
```

### Using Custom Hooks

#### Check Wallet Connection Status

```tsx
import { useWeb3Wallet } from '~/hooks/use-web3';

export default function MyComponent() {
  const { address, isConnected, chain } = useWeb3Wallet();

  if (!isConnected) {
    return <p>Please connect your wallet</p>;
  }

  return (
    <div>
      <p>Connected Address: {address}</p>
      <p>Network: {chain?.name}</p>
    </div>
  );
}
```

#### Display Wallet Balance

```tsx
import { useWalletBalance } from '~/hooks/use-web3';

export default function BalanceDisplay() {
  const { formattedBalance, symbol, isLoading } = useWalletBalance();

  if (isLoading) return <p>Loading balance...</p>;

  return (
    <p>
      Balance: {formattedBalance} {symbol}
    </p>
  );
}
```

#### Switch Networks

```tsx
import { useWeb3Chain } from '~/hooks/use-web3';

export default function NetworkSwitcher() {
  const { chainName, chains, switchChain } = useWeb3Chain();

  return (
    <div>
      <p>Current Network: {chainName}</p>
      <select onChange={(e) => switchChain({ chainId: Number(e.target.value) })}>
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

#### Format Addresses for Display

```tsx
import { useWalletDisplay } from '~/hooks/use-web3';

export default function AddressDisplay({ address }: { address: string }) {
  const { shortenAddress } = useWalletDisplay();

  return <p>{shortenAddress(address)}</p>; // "0x1234...5678"
}
```

---

## 🧩 Components

### WalletConnectButton

A complete wallet connection button with dropdown menu.

```tsx
<WalletConnectButton />
<WalletConnectButton variant="outline" size="sm" />
```

**Features:**

- Shows "Connect Wallet" when disconnected
- Displays shortened address when connected
- Dropdown menu with copy address and disconnect options
- Lists available wallet connectors

### WalletInfoCard

Displays comprehensive wallet information.

```tsx
<WalletInfoCard />
```

**Features:**

- Shows wallet address with copy button
- Displays current balance
- Shows connected network
- Link to blockchain explorer

### ChainSwitcher

Network switching dropdown.

```tsx
<ChainSwitcher />
<ChainSwitcher variant="ghost" />
```

**Features:**

- Shows current network
- Lists all available networks
- Indicates active network with checkmark
- Handles network switching

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They contain sensitive data
2. **Validate user inputs** - Always validate data before sending transactions
3. **Check network** - Verify users are on the correct network before transactions
4. **Handle errors gracefully** - Wallet rejections and network errors should be user-friendly
5. **Use read-only methods** - Prefer view functions over transactions when possible

---

## 💾 Data Persistence

All query data (including wallet balances, network info, etc.) is automatically persisted to localStorage and restored on page refresh. This is powered by TanStack Query's persistence feature.

### How It Works

```tsx
// Automatically handled by QueryClientProvider
// Query data is saved to localStorage with a 24-hour cache time
// Data is restored on page reload
```

### Benefits

- **Better UX**: No re-fetching on page refresh if data is still fresh
- **Faster Loading**: Instant display of cached data
- **Offline Support**: View previously loaded data without network
- **BigInt Support**: Properly serializes blockchain data types

### Clear Cache

To clear persisted data, users can:

```typescript
// Programmatically clear cache
queryClient.clear();

// Or manually delete from localStorage
localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
```

---

## 🚀 Advanced Usage

### Custom Wallet Connection Flow

```tsx
import { useWeb3Wallet } from '~/hooks/use-web3';

export default function CustomConnect() {
  const { connectors, connect, isPending } = useWeb3Wallet();

  return (
    <div className="grid grid-cols-2 gap-4">
      {connectors.map((connector) => (
        <button key={connector.id} onClick={() => connect(connector.id)} disabled={isPending}>
          Connect with {connector.name}
        </button>
      ))}
    </div>
  );
}
```

### Protecting Routes (Require Wallet Connection)

```tsx
import { Navigate } from 'react-router';
import { useWeb3Wallet } from '~/hooks/use-web3';

export default function ProtectedPage() {
  const { isConnected } = useWeb3Wallet();

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return <div>Protected content</div>;
}
```

### Using with React Query

```tsx
import { useWeb3Wallet } from '~/hooks/use-web3';

import { useQuery } from '@tanstack/react-query';

export default function MyVotes() {
  const { address, isConnected } = useWeb3Wallet();

  const { data: votes } = useQuery({
    queryKey: ['votes', address],
    queryFn: () => fetchUserVotes(address!),
    enabled: isConnected && !!address,
  });

  // ... render votes
}
```

---

## 🐛 Troubleshooting

### Wallet not connecting?

1. Check if MetaMask or wallet extension is installed
2. Verify the WalletConnect Project ID is set correctly
3. Check browser console for errors
4. Try refreshing the page

### Wrong network?

Use the `<ChainSwitcher />` component or prompt users to switch:

```tsx
const { chainId } = useWeb3Chain();
const REQUIRED_CHAIN_ID = 1; // Ethereum Mainnet

if (chainId !== REQUIRED_CHAIN_ID) {
  return <p>Please switch to Ethereum Mainnet</p>;
}
```

### Balance not showing?

- Ensure wallet is connected
- Check if the network supports balance queries
- Verify RPC endpoint is working

---

## 📖 References

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/)

---

## 🎓 Next Steps

1. **Add voting contract interactions** - Use viem to interact with smart contracts
2. **Implement transaction signing** - Add functions to sign and send transactions
3. **Add ENS support** - Display ENS names instead of addresses
4. **Implement wallet switching** - Allow users to switch between multiple accounts
5. **Add transaction history** - Track user's voting transactions

---

For more information, see the official documentation or reach out to the development team.
