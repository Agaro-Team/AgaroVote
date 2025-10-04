# Developer Guide - AgaroVote Frontend

**Complete guide for developers working on the AgaroVote frontend application**

---

## 📚 Documentation Index

### Getting Started

- [Project Overview](./README.md) - Project description and goals
- [Web3 Quick Start](./WEB3_QUICK_START.md) - Get wallet connection running in 5 minutes
- [Web3 Setup](./WEB3_SETUP.md) - Complete Web3 setup guide

### Smart Contract Integration

- **[Smart Contract Integration Guide](./SMART_CONTRACT_INTEGRATION.md)** - Complete guide to connecting custom smart contracts
- **[Smart Contract Quick Reference](./SMART_CONTRACT_QUICK_REFERENCE.md)** - Quick copy-paste patterns and examples

### Features & Implementation

- [Web3 Architecture](./WEB3_ARCHITECTURE.md) - Architecture overview and design decisions
- [Web3 Implementation Summary](./WEB3_IMPLEMENTATION_SUMMARY.md) - What's been implemented
- [Dark Mode](./DARK_MODE.md) - Dark mode implementation
- [Dark Mode Implementation](./DARK_MODE_IMPLEMENTATION.md) - Dark mode technical details
- [Dashboard Navigation](./DASHBOARD_NAVIGATION.md) - Navigation structure
- [Loading Components](./LOADING_COMPONENTS.md) - Loading states and skeletons

### Data & State Management

- [React Query Setup](./REACT_QUERY_SETUP.md) - Data fetching and caching
- [Persistence Setup](./PERSISTENCE_SETUP.md) - Data persistence configuration
- [Persistence Implementation](./PERSISTENCE_IMPLEMENTATION.md) - Implementation details
- [Persistence Update](./PERSISTENCE_UPDATE.md) - Latest updates

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies (using yarn as detected in yarn.lock)
yarn install

# Create .env file
cp .env.example .env

# Add your WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Development

```bash
# Start dev server
yarn dev

# Type checking
yarn typecheck

# Format code
yarn format
```

### 3. Test Wallet Connection

Navigate to: http://localhost:5173/wallet

---

## 🏗️ Project Structure

```
app/
├── components/           # React components
│   ├── ui/              # Shadcn UI components
│   ├── wallet-connect-button.tsx
│   ├── wallet-info-card.tsx
│   ├── chain-switcher.tsx
│   └── example-voting-card.tsx  # Example smart contract component
├── hooks/
│   ├── use-web3.ts              # Web3 wallet hooks
│   ├── use-mobile.ts
│   └── use-example-voting-contract.ts  # Example contract hooks
├── lib/
│   ├── web3/
│   │   ├── config.ts            # Wagmi configuration
│   │   └── provider.tsx         # Web3 provider
│   ├── contracts/
│   │   └── example-voting-contract.ts  # Example contract ABI & addresses
│   ├── query-client/            # React Query setup
│   ├── theme-provider.tsx
│   └── utils.ts
├── routes/
│   ├── home.tsx
│   ├── wallet/
│   │   ├── index.tsx            # Wallet demo page
│   │   └── layout.tsx
│   └── dashboard/
│       ├── index.tsx
│       └── layout.tsx
└── root.tsx                     # Root component with providers
```

---

## 🔧 Tech Stack

### Core
- **React Router v7** - Routing and SSR
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool

### Web3
- **wagmi v2.17.5** - React hooks for Ethereum
- **viem v2.37.11** - TypeScript Ethereum library
- **WalletConnect** - Multi-wallet support

### UI
- **Tailwind CSS v4** - Styling
- **Shadcn UI** - Component library
- **Lucide React** - Icons

### State Management
- **TanStack Query v5** - Data fetching and caching
- **React Query Persist** - Persistence layer

---

## 💡 Key Concepts

### Web3 Integration

The app uses wagmi v2 for Web3 functionality. All Web3 logic is abstracted into custom hooks:

```typescript
// Wallet connection
const { address, isConnected, connect, disconnect } = useWeb3Wallet();

// Balance
const { formattedBalance, symbol } = useWalletBalance();

// Network
const { chainId, chainName, switchChain } = useWeb3Chain();
```

### Smart Contract Interaction

Two main patterns for interacting with smart contracts:

**1. Reading Data (View Functions):**
```typescript
import { useReadContract } from 'wagmi';

const { data, isLoading } = useReadContract({
  address: contractAddress,
  abi: CONTRACT_ABI,
  functionName: 'myFunction',
  args: [BigInt(123)],
});
```

**2. Writing Data (Transactions):**
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const { writeContract, data: hash, isPending } = useWriteContract();
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

writeContract({
  address: contractAddress,
  abi: CONTRACT_ABI,
  functionName: 'myFunction',
  args: [BigInt(123)],
});
```

See [Smart Contract Integration Guide](./SMART_CONTRACT_INTEGRATION.md) for detailed examples.

---

## 🎨 UI Components

### Shadcn UI Components

Pre-built components in `app/components/ui/`:
- Avatar, Button, Card, Dialog, Dropdown Menu
- Input, Separator, Sheet, Sidebar, Skeleton
- Spinner, Tooltip, and more

### Custom Components

**Web3 Components:**
- `WalletConnectButton` - Connect/disconnect wallet
- `WalletInfoCard` - Display wallet info
- `ChainSwitcher` - Switch networks

**Example Components:**
- `ExampleVotingCard` - Full smart contract interaction example

---

## 📦 Adding a New Smart Contract

### Step 1: Create Contract Configuration

```typescript
// app/lib/contracts/my-contract.ts
export const MY_CONTRACT_ABI = [
  // Your contract ABI
] as const;

export const MY_CONTRACT_ADDRESS = {
  1: '0x...', // Mainnet
  11155111: '0x...', // Sepolia
  // Add other networks
} as const;
```

### Step 2: Create Custom Hooks

```typescript
// app/hooks/use-my-contract.ts
import { useReadContract, useWriteContract } from 'wagmi';
import { MY_CONTRACT_ABI, MY_CONTRACT_ADDRESS } from '~/lib/contracts/my-contract';

export function useMyContractData() {
  const { chainId } = useWeb3Chain();
  
  const { data, isLoading } = useReadContract({
    address: MY_CONTRACT_ADDRESS[chainId],
    abi: MY_CONTRACT_ABI,
    functionName: 'getData',
  });

  return { data, isLoading };
}
```

### Step 3: Use in Components

```typescript
// app/components/my-component.tsx
import { useMyContractData } from '~/hooks/use-my-contract';

export function MyComponent() {
  const { data, isLoading } = useMyContractData();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{data?.toString()}</div>;
}
```

For complete examples, see:
- `app/lib/contracts/example-voting-contract.ts`
- `app/hooks/use-example-voting-contract.ts`
- `app/components/example-voting-card.tsx`

---

## 🧪 Testing

### Manual Testing Checklist

**Wallet Connection:**
- [ ] Connect with MetaMask
- [ ] Connect with WalletConnect
- [ ] Connect with Coinbase Wallet
- [ ] Disconnect wallet
- [ ] Reconnect after page refresh

**Network Switching:**
- [ ] Switch to Ethereum Mainnet
- [ ] Switch to Sepolia
- [ ] Switch to Polygon
- [ ] Switch to Polygon Amoy

**Smart Contracts:**
- [ ] Read contract data
- [ ] Write to contract
- [ ] Handle transaction confirmation
- [ ] Handle transaction errors
- [ ] Auto-refetch after transaction

### Test on Different Networks

1. Deploy your contract to testnet (Sepolia/Amoy)
2. Update contract addresses in config
3. Test all functions on testnet first
4. Only deploy to mainnet after thorough testing

---

## 🎯 Code Style & Best Practices

### Following Existing Patterns

The codebase follows specific patterns - **always check existing code before adding new features:**

1. **Hook Pattern:**
   - Follow the pattern in `use-web3.ts`
   - Return objects with descriptive names
   - Include loading and error states

2. **Component Pattern:**
   - Use existing UI components from `components/ui/`
   - Follow the styling patterns
   - Use Tailwind classes consistently

3. **File Organization:**
   - Contracts in `lib/contracts/`
   - Hooks in `hooks/`
   - Components in `components/`
   - Routes in `routes/`

### TypeScript

- Use `as const` for ABIs
- Type all function parameters
- Avoid `any` types
- Use proper imports from `wagmi` and `viem`

### Naming Conventions

- Hooks: `use[Name]` (e.g., `useWeb3Wallet`)
- Components: `PascalCase` (e.g., `WalletConnectButton`)
- Files: `kebab-case.tsx` (e.g., `wallet-connect-button.tsx`)

---

## 🐛 Common Issues & Solutions

### Issue: Contract not deployed error

**Solution:** Check if contract address exists for current chain:
```typescript
const contractAddress = CONTRACT_ADDRESS[chainId];
if (!contractAddress) {
  return <div>Contract not available on this network</div>;
}
```

### Issue: BigInt errors

**Solution:** Always use `BigInt()` for large numbers:
```typescript
args: [BigInt(value)] // ✅ Correct
args: [value]          // ❌ Wrong
```

### Issue: Transaction not updating UI

**Solution:** Refetch data after successful transaction:
```typescript
const { refetch } = useReadContract({...});
const { isSuccess } = useWaitForTransactionReceipt({ hash });

useEffect(() => {
  if (isSuccess) refetch();
}, [isSuccess, refetch]);
```

### Issue: User rejected transaction

**Solution:** Handle user cancellation gracefully:
```typescript
{isError && error?.message.includes('User rejected') && (
  <div>Transaction cancelled by user</div>
)}
```

---

## 📚 Additional Resources

### External Documentation

- [wagmi Documentation](https://wagmi.sh/)
- [viem Documentation](https://viem.sh/)
- [React Router Documentation](https://reactrouter.com/)
- [TanStack Query Documentation](https://tanstack.com/query/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)

### Internal Documentation

- [Smart Contract Integration](./SMART_CONTRACT_INTEGRATION.md) - Detailed guide
- [Smart Contract Quick Reference](./SMART_CONTRACT_QUICK_REFERENCE.md) - Quick patterns
- [Web3 Architecture](./WEB3_ARCHITECTURE.md) - System design

---

## 🤝 Contributing

### Before Starting

1. Read through existing documentation
2. Check the codebase for similar implementations
3. Follow the established patterns
4. Test on testnet before mainnet

### Code Quality

```bash
# Format code before committing
yarn format

# Check types
yarn typecheck
```

### Git Workflow

1. Create feature branch
2. Follow existing code style
3. Test thoroughly
4. Format code
5. Create pull request

---

## 🚀 Deployment

### Build

```bash
# Production build
yarn build

# Start production server
yarn start
```

### Environment Variables

Required for production:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review example files
3. Check existing implementations
4. Ask the team

---

**Happy coding! 🎉**

