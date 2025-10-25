# Smart Contract Integration - Getting Started

**Quick guide to integrate your custom smart contracts with AgaroVote using Hardhat + Wagmi CLI for type-safe interactions**

---

## 📖 What's Included

This guide provides everything you need to connect and interact with your smart contracts with **full type safety**:

### Documentation

1. **[Complete Integration Guide](./docs/SMART_CONTRACT_INTEGRATION.md)**
   - Detailed explanations
   - Step-by-step setup with Hardhat
   - Type-safe contract interactions
   - Best practices
   - Common patterns
   - Complete examples
   - ~600 lines of comprehensive documentation

2. **[Quick Reference](./docs/SMART_CONTRACT_QUICK_REFERENCE.md)**
   - Quick copy-paste patterns
   - Common use cases
   - Code snippets
   - Troubleshooting tips

3. **[Developer Guide](./docs/DEVELOPER_GUIDE.md)**
   - Complete developer documentation
   - Project structure
   - Contributing guidelines
   - All documentation index

4. **[Hardhat Wagmi Integration](./docs/HARDHAT_WAGMI_INTEGRATION.md)** ⭐ NEW
   - Hardhat setup and configuration
   - Type-safe contract generation
   - Automated hook creation
   - Development workflow

### Example Files (Ready to Use)

Located in your project:

1. **Contract Configuration**
   - `app/lib/contracts/example-voting-contract.ts`
   - Shows how to setup ABI and addresses

2. **Custom Hooks**
   - `app/hooks/use-example-voting-contract.ts`
   - 10+ ready-to-use hooks for contract interaction
   - Follows your existing code patterns

3. **UI Component**
   - `app/components/example-voting-card.tsx`
   - Complete working example with UI
   - Shows loading states, error handling, transaction feedback

---

## 🚀 Quick Start with Hardhat (4 Steps)

### Step 1: Configure Wagmi CLI with Hardhat

Your `wagmi.config.ts` is already set up:

```typescript
import { defineConfig } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'app/lib/web3/contracts/generated.ts',
  plugins: [
    react(),
    hardhat({
      project: '../../', // Path to your Hardhat project
      artifacts: 'app/lib/web3/artifacts',
    }),
  ],
});
```

### Step 2: Compile Contracts & Generate Types

```bash
# Compile your Solidity contracts
npm run compile  # or: cd ../hardhat && npx hardhat compile

# Generate type-safe React hooks
npm run wagmi
```

This automatically generates:

- Type-safe contract hooks
- Proper TypeScript types
- All function signatures
- Event types

### Step 3: Use Generated Hooks

```typescript
// app/components/your-component.tsx
import {
  useReadYourContractGetData,
  useWriteYourContractSetData,
} from '~/lib/web3/contracts/generated';

export function YourComponent() {
  // Read contract data (type-safe!)
  const { data, isLoading } = useReadYourContractGetData();

  // Write to contract (type-safe!)
  const { writeContract, isPending } = useWriteYourContractSetData();

  const handleUpdate = () => {
    writeContract({
      args: [BigInt(123)],  // TypeScript knows the exact parameter types!
      chainId: 1,
    });
  };

  return (
    // Your JSX
  );
}
```

### Step 4: Enjoy Type Safety!

```typescript
// app/components/your-component.tsx
import { useYourData, useYourAction } from '~/hooks/use-your-contract';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export function YourComponent() {
  const { data, isLoading } = useYourData();
  const { execute, isPending, isSuccess } = useYourAction();

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Data: {data?.toString()}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={execute} disabled={isPending}>
          {isPending ? 'Processing...' : 'Execute'}
        </Button>
        {isSuccess && <p>✅ Success!</p>}
      </CardContent>
    </Card>
  );
}
```

All contract functions are now type-safe:

- ✅ Function names autocomplete
- ✅ Parameter types are enforced
- ✅ Return types are inferred
- ✅ No manual ABI configuration needed!

---

## 📚 Learn More

### For Complete Details

Read the **[Complete Integration Guide](./docs/SMART_CONTRACT_INTEGRATION.md)** which covers:

- ✅ Complete setup instructions
- ✅ Reading contract data (view functions)
- ✅ Writing to contracts (transactions)
- ✅ Creating custom hooks
- ✅ Handling events
- ✅ Error handling
- ✅ Loading states
- ✅ Best practices
- ✅ Multiple complete examples

### For Quick Copy-Paste

Use the **[Quick Reference Guide](./docs/SMART_CONTRACT_QUICK_REFERENCE.md)** for:

- ✅ Common patterns
- ✅ Code snippets
- ✅ Utility functions
- ✅ Troubleshooting
- ✅ Performance tips

### For Project Overview

Check the **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** for:

- ✅ Project structure
- ✅ Tech stack overview
- ✅ All documentation index
- ✅ Contributing guidelines

---

## 🎯 Key Concepts

### Reading Data (View Functions)

```typescript
import { useReadContract } from 'wagmi';

const { data, isLoading } = useReadContract({
  address: contractAddress,
  abi: ABI,
  functionName: 'myFunction',
  args: [BigInt(123)], // Use BigInt for uint256
});
```

- ❌ No gas required
- ✅ Instant results
- 🔄 Automatic caching with React Query

### Writing Data (Transactions)

```typescript
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

const { writeContract, data: hash, isPending } = useWriteContract();
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

writeContract({
  address: contractAddress,
  abi: ABI,
  functionName: 'myFunction',
  args: [BigInt(123)],
});
```

- ✅ Requires gas
- ⏳ Needs confirmation
- 💰 User pays transaction fee

---

## 🎨 Example Components

### Check Out These Examples

1. **Full Featured Component**
   - `app/components/example-voting-card.tsx`
   - Complete UI with loading states, errors, transactions
   - Ready to customize for your needs

2. **Custom Hooks**
   - `app/hooks/use-example-voting-contract.ts`
   - 10+ hooks showing different patterns
   - Read, write, watch events, batch operations

3. **Contract Config**
   - `app/lib/contracts/example-voting-contract.ts`
   - Proper TypeScript setup
   - Multi-chain configuration

---

## 🛠️ Your Existing Setup

You already have:

- ✅ wagmi v2.17.5 configured
- ✅ viem v2.37.11 installed
- ✅ Multiple wallet support (MetaMask, WalletConnect, Coinbase)
- ✅ Multi-chain ready (Ethereum, Polygon, Sepolia, Amoy)
- ✅ Custom Web3 hooks (`useWeb3Wallet`, `useWalletBalance`, `useWeb3Chain`)
- ✅ Shadcn UI components
- ✅ React Query for data fetching
- ✅ TypeScript strict mode

All you need to do is add your contract ABI and start building! 🚀

---

## 📞 Common Questions

### Q: Do I need to modify existing Web3 setup?

**A:** No! Your Web3 setup is complete. Just add your contract configuration and hooks.

### Q: Can I use multiple contracts?

**A:** Yes! Create separate files for each contract in `lib/contracts/` and corresponding hooks.

### Q: What about TypeScript types?

**A:** Always use `as const` on your ABI for automatic type inference.

### Q: How do I handle errors?

**A:** Check the example component for error handling patterns.

### Q: What about transaction confirmations?

**A:** Use `useWaitForTransactionReceipt` to wait for confirmations.

---

## 🎉 You're Ready!

You have everything you need:

1. ✅ Complete documentation (600+ lines)
2. ✅ Quick reference guide
3. ✅ Working example files
4. ✅ Existing Web3 infrastructure
5. ✅ TypeScript support
6. ✅ UI components ready

**Next Steps:**

1. Read the [Complete Guide](./docs/SMART_CONTRACT_INTEGRATION.md)
2. Check the [example files](#example-files-ready-to-use)
3. Start integrating your contracts!

---

## 📖 Documentation Links

### Primary Guides

- **[Hardhat Wagmi Integration](./docs/HARDHAT_WAGMI_INTEGRATION.md)** ⭐ **START HERE** - Type-safe contracts with Hardhat + Wagmi
- **[Complete Integration Guide](./docs/SMART_CONTRACT_INTEGRATION.md)** - Full documentation
- **[Quick Reference](./docs/SMART_CONTRACT_QUICK_REFERENCE.md)** - Quick patterns

### Additional Resources

- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Project overview
- **[Web3 Setup](./docs/WEB3_SETUP.md)** - Web3 configuration
- **[Web3 Quick Start](./docs/WEB3_QUICK_START.md)** - Get started in 5 minutes

---

## 🎯 Key Advantages of Hardhat + Wagmi

1. **Type Safety** - Catch errors at compile time, not runtime
2. **Auto-completion** - Your IDE knows your contract functions
3. **No Manual ABI** - Automatically generated from Solidity
4. **Simplified Workflow** - Compile once, use everywhere
5. **Always Up-to-Date** - Regenerate types when contracts change

---

**Happy coding! Check the [Hardhat Wagmi Integration Guide](./docs/HARDHAT_WAGMI_INTEGRATION.md) to get started with type-safe contracts! 🎨**
