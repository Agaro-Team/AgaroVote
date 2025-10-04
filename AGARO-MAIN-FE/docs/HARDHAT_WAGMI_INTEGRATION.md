# Hardhat + Wagmi Integration Guide

Complete guide for type-safe smart contract interactions using Hardhat and Wagmi CLI in AgaroVote.

---

## 📖 Overview

This setup provides:
- ✅ **Type-safe contract interactions** - TypeScript knows your contract functions
- ✅ **Automatic hook generation** - No manual ABI configuration
- ✅ **Auto-complete support** - Your IDE suggests function names and parameters
- ✅ **Compile-time safety** - Catch errors before runtime
- ✅ **Simplified workflow** - Compile once, use everywhere

---

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have:
- Hardhat project with compiled contracts
- `@wagmi/cli` installed (already included)
- Wagmi configuration file (`wagmi.config.ts`)

### 2. Configuration

Your `wagmi.config.ts` is already configured:

```typescript
import { defineConfig } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'app/lib/web3/contracts/generated.ts',
  plugins: [
    react(),
    hardhat({
      project: '../../',  // Path to Hardhat project
      artifacts: 'app/lib/web3/artifacts',
    }),
  ],
});
```

### 3. Workflow

```bash
# Step 1: Compile Solidity contracts
cd ../hardhat
npx hardhat compile

# Step 2: Generate type-safe hooks
cd ../frontend
npm run wagmi

# Step 3: Use in your components!
```

---

## 📝 Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "wagmi": "wagmi generate",
    "wagmi:watch": "wagmi generate --watch",
    "compile": "cd ../hardhat && npx hardhat compile",
    "generate": "npm run compile && npm run wagmi"
  }
}
```

---

## 💻 Usage Examples

### Reading Contract Data

```typescript
import { useReadVotingGetProposal } from '~/lib/web3/contracts/generated';

export function ProposalCard({ proposalId }: { proposalId: bigint }) {
  const { data: proposal, isLoading } = useReadVotingGetProposal({
    args: [proposalId],
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{proposal?.title}</h2>
      <p>{proposal?.description}</p>
    </div>
  );
}
```

### Writing to Contracts

```typescript
import { useWriteVotingCastVote } from '~/lib/web3/contracts/generated';

export function VoteButton({ proposalId }: { proposalId: bigint }) {
  const { writeContract, isPending, isSuccess } = useWriteVotingCastVote();

  const handleVote = (vote: boolean) => {
    writeContract({
      args: [proposalId, vote],
      chainId: 1,
    });
  };

  return (
    <button 
      onClick={() => handleVote(true)} 
      disabled={isPending}
    >
      {isPending ? 'Voting...' : 'Cast Vote'}
    </button>
  );
}
```

### Watching Events

```typescript
import { useWatchVotingVoteCastEvent } from '~/lib/web3/contracts/generated';

export function VoteListener() {
  useWatchVotingVoteCastEvent({
    listener(log) {
      const { proposalId, voter, vote } = log.args;
      console.log(`Vote cast: ${voter} voted ${vote} on proposal ${proposalId}`);
    },
  });

  return null;
}
```

### Complete Component Example

```typescript
import {
  useReadVotingGetProposal,
  useWriteVotingCastVote,
  useWatchVotingVoteCastEvent,
} from '~/lib/web3/contracts/generated';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export function VotingCard({ proposalId }: { proposalId: bigint }) {
  const [localVotes, setLocalVotes] = useState(0);

  // Read proposal data
  const { data: proposal, isLoading, refetch } = useReadVotingGetProposal({
    args: [proposalId],
  });

  // Cast vote
  const { writeContract: castVote, isPending } = useWriteVotingCastVote();

  // Listen for vote events
  useWatchVotingVoteCastEvent({
    listener(log) {
      if (log.args.proposalId === proposalId) {
        setLocalVotes(prev => prev + 1);
        refetch(); // Refresh proposal data
      }
    },
  });

  const handleVote = (vote: boolean) => {
    castVote({
      args: [proposalId, vote],
      chainId: 1,
    });
  };

  if (isLoading) return <div>Loading proposal...</div>;
  if (!proposal) return <div>Proposal not found</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{proposal.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{proposal.description}</p>
        <div className="mt-4 space-x-2">
          <Button 
            onClick={() => handleVote(true)} 
            disabled={isPending}
          >
            Vote Yes
          </Button>
          <Button 
            onClick={() => handleVote(false)} 
            disabled={isPending}
            variant="outline"
          >
            Vote No
          </Button>
        </div>
        {localVotes > 0 && (
          <p className="mt-2 text-sm">New votes: {localVotes}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Type Safety Benefits

### Before (Manual ABI)

```typescript
// ❌ No type safety
const { data } = useReadContract({
  address: '0x...',
  abi: VOTING_ABI,
  functionName: 'getProposl',  // Typo! No error until runtime
  args: ['123'],  // Wrong type! Should be BigInt
});
```

### After (Generated Hooks)

```typescript
// ✅ Full type safety
const { data } = useReadVotingGetProposal({
  args: [BigInt(123)],  // TypeScript enforces correct types
});
// getProposl would show an error immediately
```

---

## 🔄 Development Workflow

### Watch Mode

```bash
# Terminal 1: Watch Hardhat changes
cd ../hardhat
npx hardhat watch compilation

# Terminal 2: Watch for hook generation
cd ../frontend
npm run wagmi:watch
```

### Update Flow

1. Edit your Solidity contract
2. Contracts auto-compile (or run `npx hardhat compile`)
3. Hooks auto-regenerate (or run `npm run wagmi`)
4. TypeScript shows updated types immediately!

---

## 📁 Project Structure

```
AGARO-MAIN-FE/
├── wagmi.config.ts              # Wagmi CLI configuration
├── app/
│   └── lib/
│       └── web3/
│           ├── artifacts/       # Hardhat artifacts (gitignored)
│           └── contracts/
│               └── generated.ts # Auto-generated hooks ✨
└── package.json

../HARDHAT-PROJECT/
├── contracts/
│   └── Voting.sol              # Your contracts
├── artifacts/                  # Build output
└── hardhat.config.ts
```

---

## ⚙️ Configuration Options

### Basic Configuration

```typescript
export default defineConfig({
  out: 'app/lib/web3/contracts/generated.ts',
  plugins: [
    react(),
    hardhat({
      project: '../../',
      artifacts: 'app/lib/web3/artifacts',
    }),
  ],
});
```

### Advanced Configuration

```typescript
export default defineConfig({
  out: 'app/lib/web3/contracts/generated.ts',
  plugins: [
    react({
      // Customize hook names
      getHookName: ({ contractName, type, itemName }) => {
        return `use${contractName}${type}${itemName}`;
      },
    }),
    hardhat({
      project: '../../hardhat',
      artifacts: 'app/lib/web3/artifacts',
      // Include/exclude specific contracts
      include: ['Voting.sol/**'],
      exclude: ['Test*.sol/**'],
      // Deploy address configuration
      deployments: {
        Voting: {
          1: '0x...', // Mainnet
          11155111: '0x...', // Sepolia
        },
      },
    }),
  ],
});
```

---

## 🐛 Troubleshooting

### Issue: Hooks not generating

**Solution:**
```bash
# 1. Ensure contracts are compiled
cd ../hardhat && npx hardhat compile

# 2. Check artifacts exist
ls ../hardhat/artifacts/contracts

# 3. Regenerate hooks
cd ../frontend && npm run wagmi
```

### Issue: Type errors after contract update

**Solution:**
```bash
# Regenerate everything
npm run generate  # or manually:
# npm run compile && npm run wagmi
```

### Issue: Wrong contract address

**Solution:**
Update addresses in `wagmi.config.ts`:
```typescript
hardhat({
  // ...
  deployments: {
    Voting: {
      1: '0xYourMainnetAddress',
      11155111: '0xYourSepoliaAddress',
    },
  },
})
```

### Issue: Cannot find generated hooks

**Check:**
1. Output path in `wagmi.config.ts`
2. Import path in your components
3. Generated file exists

---

## 📚 Best Practices

### 1. Always Regenerate After Contract Changes

```bash
# After editing Solidity
npm run generate
```

### 2. Gitignore Generated Files (Optional)

Add to `.gitignore`:
```
app/lib/web3/contracts/generated.ts
app/lib/web3/artifacts/
```

### 3. Use TypeScript Strictly

```typescript
// ✅ Good: Let TypeScript infer types
const { data } = useReadVotingGetProposal({ args: [proposalId] });

// ❌ Avoid: Casting types
const data = result.data as any;
```

### 4. Handle Loading and Error States

```typescript
const { data, isLoading, error } = useReadVotingGetProposal({ 
  args: [proposalId] 
});

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
if (!data) return <NotFound />;

return <Display data={data} />;
```

### 5. Use Watch Mode in Development

```bash
npm run wagmi:watch
```

---

## 🔗 Additional Resources

- [Wagmi CLI Documentation](https://wagmi.sh/cli/getting-started)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Wagmi React Hooks](https://wagmi.sh/react/getting-started)
- [Viem Documentation](https://viem.sh/)

---

## 📞 Need Help?

Check these docs:
- [Smart Contract Integration](./SMART_CONTRACT_INTEGRATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Web3 Setup](./WEB3_SETUP.md)

---

**That's it! You now have fully type-safe contract interactions. Happy coding! 🎉**