# Web3 Architecture Overview

Visual guide to the Web3 wallet connection infrastructure

---

## 🏗️ Component Hierarchy

```
root.tsx
  ├── ThemeProvider
  │   └── QueryClientProvider
  │       └── Web3Provider (wagmi + viem)
  │           └── Application Components
  │               ├── WalletConnectButton
  │               ├── WalletInfoCard
  │               ├── ChainSwitcher
  │               └── Your Custom Components
```

---

## 📦 Module Structure

```
app/
├── lib/
│   └── web3/
│       ├── config.ts              # Chains & connectors setup
│       └── provider.tsx           # WagmiProvider wrapper
│
├── hooks/
│   └── use-web3.ts               # Custom hooks layer
│       ├── useWeb3Wallet()       # Connection state
│       ├── useWalletBalance()    # Balance queries
│       ├── useWeb3Chain()        # Network info
│       └── useWalletDisplay()    # Formatting utils
│
└── components/
    ├── wallet-connect-button.tsx  # Connect UI
    ├── wallet-info-card.tsx       # Info display
    └── chain-switcher.tsx         # Network switcher
```

---

## 🔄 Data Flow

### Wallet Connection Flow

```
User Action
    ↓
WalletConnectButton
    ↓
useWeb3Wallet() hook
    ↓
wagmi useConnect() / useDisconnect()
    ↓
WagmiProvider (context)
    ↓
viem (blockchain interaction)
    ↓
Wallet Extension / WalletConnect
    ↓
Blockchain Network
```

### Balance Query Flow

```
useWalletBalance() hook
    ↓
wagmi useBalance()
    ↓
React Query (caching)
    ↓
viem publicClient
    ↓
RPC Endpoint
    ↓
Blockchain Network
```

---

## 🎯 Layer Responsibilities

### 1. Configuration Layer (`lib/web3/config.ts`)

**Responsibility:** Define supported chains, wallets, and network settings

```typescript
export const config = createConfig({
  chains: [mainnet, sepolia, polygon, polygonAmoy],
  connectors: [injected(), walletConnect(), coinbaseWallet()],
  transports: { ... }
});
```

### 2. Provider Layer (`lib/web3/provider.tsx`)

**Responsibility:** Provide Web3 context to the entire application

```typescript
<WagmiProvider config={config}>
  {children}
</WagmiProvider>
```

### 3. Hook Layer (`hooks/use-web3.ts`)

**Responsibility:** Simplify wagmi hooks for application use

```typescript
// Simplified wrapper around wagmi hooks
export function useWeb3Wallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  // ... return simplified API
}
```

### 4. Component Layer (`components/wallet-*.tsx`)

**Responsibility:** Provide reusable UI components

```typescript
export function WalletConnectButton() {
  const { isConnected, connect, disconnect } = useWeb3Wallet();
  // ... render UI
}
```

### 5. Application Layer (Your pages/routes)

**Responsibility:** Use components and hooks to build features

```typescript
export default function VotingPage() {
  const { isConnected } = useWeb3Wallet();
  // ... your voting logic
}
```

---

## 🔌 Connector Architecture

```
Application
    ↓
Wagmi Connectors
    ├── Injected Connector
    │   ├── MetaMask
    │   ├── Rainbow Wallet
    │   └── Brave Wallet
    │
    ├── WalletConnect Connector
    │   ├── Mobile Wallets
    │   └── QR Code Connection
    │
    └── Coinbase Wallet Connector
        └── Coinbase Extension/App
```

---

## 🌐 Multi-Chain Support

```
config.ts
    ↓
supportedChains
    ├── Mainnet (id: 1)
    │   └── http://ethereum-rpc
    ├── Sepolia (id: 11155111)
    │   └── http://sepolia-rpc
    ├── Polygon (id: 137)
    │   └── http://polygon-rpc
    └── Polygon Amoy (id: 80002)
        └── http://amoy-rpc
```

Users can switch between chains using `ChainSwitcher` component or `useWeb3Chain()` hook.

---

## 💾 State Management

### React Query Integration

```
wagmi hooks → React Query
    ├── Automatic caching
    ├── Background refetching
    ├── Optimistic updates
    └── Error retry logic
```

### Context State

```
WagmiProvider
    ├── Active account
    ├── Connected chain
    ├── Connection status
    └── Available connectors
```

---

## 🔐 Security Architecture

### 1. Client-Side Only

- Wallet private keys never leave the user's wallet
- No sensitive data stored in application

### 2. User Approval Required

- All transactions require explicit user approval
- Connection requests shown in wallet UI

### 3. Network Verification

- Always verify correct network before transactions
- Prompt users to switch if on wrong network

### 4. Address Validation

- Validate all addresses before use
- Use checksummed addresses

---

## 🎨 UI Component Architecture

### WalletConnectButton

```
[Not Connected]
    ↓ click
Dropdown Menu
    ├── MetaMask
    ├── WalletConnect
    └── Coinbase Wallet
        ↓ select
    [Connecting...]
        ↓ approved
    [Connected: 0x1234...5678]
```

### ChainSwitcher

```
[Current Network: Ethereum]
    ↓ click
Dropdown Menu
    ├── ✓ Ethereum Mainnet
    ├── Sepolia Testnet
    ├── Polygon Mainnet
    └── Polygon Amoy
        ↓ select
    [Switching...]
        ↓ approved
    [Current Network: Polygon]
```

---

## 🔄 Hook Dependencies

```
useWeb3Wallet
    └── wagmi/useAccount
    └── wagmi/useConnect
    └── wagmi/useDisconnect

useWalletBalance
    └── wagmi/useAccount
    └── wagmi/useBalance
        └── viem/formatEther

useWeb3Chain
    └── wagmi/useChainId
    └── wagmi/useSwitchChain

useWalletDisplay
    └── Pure utility functions (no dependencies)
```

---

## 🚀 Extensibility Points

### 1. Add New Chains

```typescript
// lib/web3/config.ts
import { arbitrum } from 'wagmi/chains';

export const supportedChains = [
  mainnet,
  sepolia,
  polygon,
  polygonAmoy,
  arbitrum, // Add new chain
];
```

### 2. Add New Wallets

```typescript
// lib/web3/config.ts
import { safe } from 'wagmi/connectors';

connectors: [
  injected(),
  walletConnect(),
  coinbaseWallet(),
  safe(), // Add new connector
];
```

### 3. Add Custom Hooks

```typescript
// hooks/use-web3.ts
export function useContractRead() {
  // Your custom hook logic
}
```

### 4. Add New Components

```typescript
// components/transaction-button.tsx
export function TransactionButton() {
  const { address } = useWeb3Wallet();
  // Your transaction logic
}
```

---

## 📊 Performance Considerations

### Caching Strategy

- **Balance queries:** 2 minutes stale time
- **Chain data:** Cached indefinitely
- **Connection state:** Real-time updates

### Bundle Size

- **wagmi:** ~30KB gzipped
- **viem:** ~20KB gzipped
- **Total Web3 overhead:** ~50KB

### Optimization Tips

1. Use React.lazy() for wallet components on auth-only pages
2. Disable unnecessary refetching
3. Use wagmi's built-in multicall for batch requests

---

## 🧪 Testing Strategy

### Unit Tests

- Test hooks in isolation
- Mock wagmi hooks
- Test utility functions

### Integration Tests

- Test component interactions
- Test wallet connection flow
- Test network switching

### E2E Tests

- Test with real wallet extensions
- Test transaction signing
- Test error scenarios

---

This architecture provides a solid foundation for building Web3 features while remaining maintainable and extensible.
