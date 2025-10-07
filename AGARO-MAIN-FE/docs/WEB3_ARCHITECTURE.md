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
│   ├── web3/
│   │   ├── config.ts                     # Chains & connectors setup (cookie storage)
│   │   ├── provider.tsx                  # WagmiProvider wrapper
│   │   ├── voting-pool-utils.ts          # Voting pool encoding, hashing, validation
│   │   └── contracts/
│   │       ├── entry-point-config.ts     # Contract addresses per chain
│   │       └── generated.ts              # Auto-generated hooks from @wagmi/cli
│   └── query-client/
│       ├── config.ts                     # React Query configuration
│       └── provider.tsx                  # Query client provider
│
├── hooks/
│   ├── use-web3.ts                      # Custom hooks layer
│   │   ├── useWeb3Wallet()              # Connection state
│   │   ├── useWalletBalance()           # Balance queries
│   │   ├── useWeb3Chain()               # Network info
│   │   ├── useWalletDisplay()           # Formatting utils
│   │   └── useWaitForTransactionReceiptEffect()  # Transaction confirmation
│   ├── use-optimistic-mutation.ts       # Optimistic updates
│   └── voting-pools/
│       ├── use-create-voting-pool.ts    # Create pools with hash verification
│       └── use-voting-pool.ts           # Compute and verify pool hashes
│
└── components/
    ├── wallet-connect-button.tsx        # Connect UI
    ├── wallet-info-card.tsx             # Info display
    ├── chain-switcher.tsx               # Network switcher
    └── voting-pools/
        ├── create-voting-pool-form.tsx  # Pool creation form
        ├── voting-pool-card.tsx         # Pool display card
        └── voting-pools-list.tsx        # List of pools
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
    └── Hardhat (id: 31337)
        └── http://localhost:8545 (local development)
```

### Contract Deployment Per Chain

```
entry-point-config.ts
    ↓
ENTRY_POINT_CONTRACT_ADDRESS
    ├── 1: VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET
    ├── 11155111: VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA
    └── 31337: VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT
```

Users can switch between chains using `ChainSwitcher` component or `useWeb3Chain()` hook.

---

## 💾 State Management

### React Query Integration

```
wagmi hooks → React Query
    ├── Automatic caching
    ├── Background refetching
    ├── Optimistic updates (via useOptimisticMutation)
    ├── Error retry logic
    └── Query persistence (localStorage)
```

### Context State

```
WagmiProvider (with cookie storage)
    ├── Active account
    ├── Connected chain
    ├── Connection status
    ├── Available connectors
    └── Connection persistence (cookies for SSR)
```

### Optimistic Updates Flow

```
User Action
    ↓
useOptimisticMutation
    ↓
1. Cancel queries
2. Snapshot current data
3. Update cache optimistically
    ↓
Contract Write
    ↓
Success → Refetch real data
Error → Rollback to snapshot
```

---

## 🗳️ Voting Pool Architecture

### Hash Verification System

```
Off-Chain (Frontend)
    ↓
1. User submits voting pool data
    ↓
2. Compute hash off-chain (voting-pool-utils.ts)
   - Encode: title, description, candidates, total, version, owner
   - Hash: keccak256(encoded data)
    ↓
3. Store hash for later verification
    ↓
4. Submit transaction to EntryPoint contract
    ↓
On-Chain (Smart Contract)
    ↓
5. Contract computes hash with same logic
    ↓
6. Contract emits VotingPoolCreated event with hash
    ↓
7. Frontend watches event
    ↓
8. Compare off-chain hash vs on-chain hash
    ↓
9. If match → Success ✅
   If mismatch → Security Alert! 🚨
```

### Replay Attack Prevention

```
Version Tracking
    ↓
Each pool creation increments version
    ↓
Version included in hash computation
    ↓
Same data + different version = different hash
    ↓
Prevents replay attacks
```

### Transaction Lifecycle

```
1. [Sending] → User confirms in wallet
2. [Pending] → Transaction hash received
3. [Confirming] → Waiting for block inclusion
4. [Confirmed] → Transaction mined
5. [Verified] → Hash matches, pool created ✅
```

---

## 🔐 Security Architecture

### 1. Client-Side Only

- Wallet private keys never leave the user's wallet
- No sensitive data stored in application
- Hash computation done client-side (gas savings + verification)

### 2. User Approval Required

- All transactions require explicit user approval
- Connection requests shown in wallet UI

### 3. Network Verification

- Always verify correct network before transactions
- Prompt users to switch if on wrong network
- Contract addresses configured per chain

### 4. Address Validation

- Validate all addresses before use
- Use checksummed addresses
- Validate voting pool data before submission

### 5. Hash Verification

- Off-chain hash computation for transparency
- On-chain hash verification for security
- Event-based verification to detect anomalies

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
import { polygon } from 'wagmi/chains';

export const supportedChains = [
  mainnet,
  sepolia,
  hardhat,
  polygon, // Add new chain
];

// lib/web3/contracts/entry-point-config.ts
export const ENTRY_POINT_CONTRACT_ADDRESS: Record<number, Address> = {
  1: import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_MAINNET,
  11155111: import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_SEPOLIA,
  31337: import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_HARDHAT,
  137: import.meta.env.VITE_AGARO_VOTE_CONTRACT_ADDRESS_POLYGON, // Add
};
```

### 2. Add New Wallets (Currently Commented Out)

```typescript
// lib/web3/config.ts - Uncomment to enable
connectors: [
  injected({ shimDisconnect: true }),
  walletConnect({ projectId, ... }),
  coinbaseWallet({ appName: 'AgaroVote', ... }),
  // Add more connectors here
];
```

### 3. Add Custom Contract Hooks

```typescript
// hooks/voting-pools/use-vote.ts
import { useWriteEntryPointVote } from '~/lib/web3/contracts/generated';

export function useVote() {
  // Your voting logic with optimistic updates
}
```

### 4. Add New Voting Pool Features

```typescript
// hooks/voting-pools/use-voting-results.ts
export function useVotingResults(poolId: bigint) {
  // Fetch and display voting results
}
```

### 5. Extend Optimistic Mutations

```typescript
// Use existing useOptimisticMutation for new features
const mutation = useOptimisticMutation({
  queryKey,
  optimisticUpdate: (oldData) => /* custom logic */,
  successMessage: 'Action completed!',
});
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
