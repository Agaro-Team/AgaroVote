# Create Voting Pool Form - Contract Integration Update

This document outlines the updates made to the create voting pool form to align with the updated smart contract requirements.

## Overview

The form has been updated to support the new contract fields:
- **Expiry Date**: Start and end dates for voting periods
- **Private Pools**: Restrict voting to whitelisted addresses using Merkle trees
- **Merkle Root Hash**: Off-chain computation for gas optimization

## Changes Made

### 1. New Form Fields

#### Date Picker Field (`expiryDate`)
- **Type**: Date
- **Purpose**: Allows users to select when the voting period ends
- **Implementation**: 
  - `startDate` is automatically set to current timestamp
  - `endDate` is set to the user-selected date
  - Validation ensures the date is in the future
  - Cannot select past dates

```typescript
expiryDate: z
  .date({
    message: 'Expiry date is required',
  })
  .refine((date) => date > new Date(), 'Expiry date must be in the future')
```

#### Private Pool Switch (`isPrivate`)
- **Type**: Boolean
- **Purpose**: Toggle between public and private voting pools
- **Default**: `false` (public pool)
- **Behavior**: Shows/hides the allowed addresses field

```typescript
isPrivate: z.boolean().default(false)
```

#### Allowed Addresses Field (`allowedAddresses`)
- **Type**: Array of strings (Ethereum addresses)
- **Purpose**: Whitelist wallet addresses for private pools
- **Validation**:
  - Required when `isPrivate` is `true`
  - Each address must be a valid Ethereum address
  - Addresses must be unique (case-insensitive)
  - At least 1 address required for private pools
- **UI**: Dynamic array field with add/remove functionality

```typescript
allowedAddresses: z.array(z.string()).optional()
```

### 2. Merkle Root Hash Generation

Following the smart contract test implementation (see `Voting.ts` lines 315-332), the Merkle root hash is generated **off-chain** to minimize gas fees:

```typescript
const generateMerkleRoot = (addresses: string[]): `0x${string}` => {
  // Hash each address using keccak256
  const leaves = addresses.map((addr) => keccak256(addr));
  
  // Create merkle tree with sorted pairs
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  
  // Get the root hash
  const root = tree.getHexRoot() as `0x${string}`;
  
  return root;
};
```

**Key Points:**
- Each address is hashed individually using `keccak256`
- Merkle tree is created with `sortPairs: true` for consistent root generation
- Only the root hash is sent to the blockchain
- For public pools, uses zero hash: `0x0000...0000`

### 3. Timestamp Conversion

Expiry dates are converted from JavaScript `Date` objects to Unix timestamps:

```typescript
const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
const endDate = Math.floor(poolData.expiryDate.getTime() / 1000); // Convert to Unix timestamp

// Contract expects BigInt for timestamps
expiry: {
  startDate: BigInt(now),
  endDate: BigInt(endDate),
}
```

### 4. Updated Contract Arguments

The `writeContract` call now includes all new fields:

```typescript
writeContract({
  address: contractAddress,
  args: [
    {
      title: poolData.title,
      description: poolData.description,
      merkleRootHash,           // NEW: Merkle root or zero hash
      isPrivate: poolData.isPrivate, // NEW: Privacy flag
      candidates: poolData.candidates,
      candidatesTotal: candidatesTotalUint8,
      expiry: {                 // NEW: Expiry timestamps
        startDate: BigInt(now),
        endDate: BigInt(endDate),
      },
    },
  ],
});
```

## New Components

### AllowedAddressesField Component
- Location: `app/components/voting-pools/allowed-addresses-field.tsx`
- Purpose: Manage dynamic array of wallet addresses
- Features:
  - Add/remove addresses
  - Validation on blur
  - Monospace font for addresses
  - Minimum 1 address for private pools

## UI/UX Improvements

1. **Conditional Fields**: The allowed addresses field only appears when "Private Pool" is enabled
2. **Default Values**: Expiry date defaults to tomorrow for better UX
3. **Validation Feedback**: Real-time validation for all fields
4. **Address Format**: Monospace font for better readability of addresses
5. **Informative Descriptions**: Clear descriptions for each field explaining their purpose

## Gas Optimization

By computing the Merkle root **off-chain**, we significantly reduce gas costs:
- Only the 32-byte root hash is sent to the blockchain
- Instead of sending potentially hundreds of addresses on-chain
- Voters can prove their inclusion later using Merkle proofs

## Dependencies Added

```json
{
  "keccak256": "^1.0.6"
}
```

Note: `merkletreejs` was already present in the dependencies.

## Testing Checklist

- [x] Form validates required fields
- [x] Date picker only allows future dates
- [x] Private pool toggle shows/hides address field
- [x] Address validation works correctly
- [x] Merkle root generation matches test implementation
- [x] Timestamps are correctly converted to Unix format
- [x] Contract call includes all new fields
- [ ] End-to-end test with deployed contract
- [ ] Verify Merkle proof validation on voting

## Example Usage

### Public Pool
```typescript
{
  title: "Community Vote",
  description: "Vote for the next feature",
  choices: ["Feature A", "Feature B"],
  expiryDate: new Date(2025-11-01),
  isPrivate: false,
  allowedAddresses: []
}
```

### Private Pool
```typescript
{
  title: "Board Members Vote",
  description: "Internal decision",
  choices: ["Yes", "No"],
  expiryDate: new Date(2025-11-01),
  isPrivate: true,
  allowedAddresses: [
    "0x1234...",
    "0x5678...",
    "0xabcd..."
  ]
}
```

## Next Steps

1. Update the voting hook to generate and verify Merkle proofs
2. Add UI to display pool expiry status
3. Implement pool filtering by status (active/expired)
4. Add address import functionality (CSV/JSON)
5. Create documentation for voters on how to verify their inclusion in private pools

## References

- Smart Contract Test: `AGARO-CONTRACT/test/Voting.ts` (lines 315-405)
- Form Component: `app/components/voting-pools/create-voting-pool-form.tsx`
- Hook Implementation: `app/hooks/voting-pools/use-create-voting-pool.ts`
- Merkle Tree Library: [merkletreejs](https://github.com/merkletreejs/merkletreejs)

