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
# Smart Contract Addresses
VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET=0x...
VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA=0x...
VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT=0x...

# Optional: WalletConnect (currently not in use)
# VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get your WalletConnect Project ID at: https://cloud.walletconnect.com (if enabling WalletConnect)

### 2. Supported Networks

Currently configured networks (see `app/lib/web3/config.ts`):

- **Ethereum Mainnet** (Chain ID: 1)
- **Sepolia Testnet** (Chain ID: 11155111)
- **Hardhat Local** (Chain ID: 31337) - For local development

To add more networks, edit `supportedChains` in `config.ts`.

### 3. Wallet Connectors

**Note:** Wallet connectors are currently commented out in the config. The app uses the default browser wallet (MetaMask, etc.).

To enable additional connectors, uncomment and configure in `app/lib/web3/config.ts`:

- **Injected** - MetaMask, Rainbow, Brave Wallet, etc.
- **WalletConnect** - Mobile wallets via QR code (requires Project ID)
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

All wagmi connection data is automatically persisted using **cookie storage** for SSR compatibility. This is configured in the wagmi config.

### How It Works

```tsx
// Configured in app/lib/web3/config.ts
storage: createStorage({
  storage: cookieStorage, // Uses cookies instead of localStorage for SSR
})
```

### Benefits

- **SSR Compatible**: Works with React Router's server-side rendering
- **Persistent Connection**: Wallet stays connected across page refreshes
- **Secure**: Uses HttpOnly cookies when configured
- **Cross-Tab Sync**: Connection state syncs across browser tabs

### Clear Connection Data

To disconnect and clear storage:

```typescript
// Use the disconnect function from useWeb3Wallet
const { disconnect } = useWeb3Wallet();
disconnect();
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

1. ✅ **Smart Contract Integration** - EntryPoint contract integrated with auto-generated hooks
2. ✅ **Transaction Signing** - Implemented via wagmi's useWriteContract
3. ✅ **Voting Pool Creation** - Create and manage voting pools on-chain
4. ✅ **Hash Verification** - Off-chain hash computation with on-chain verification
5. **Future Enhancements**:
   - Add ENS support - Display ENS names instead of addresses
   - Implement wallet switching - Allow users to switch between multiple accounts
   - Add transaction history - Track user's voting transactions
   - Enable WalletConnect - Support mobile wallets

---

For more information, see the official documentation or reach out to the development team.
