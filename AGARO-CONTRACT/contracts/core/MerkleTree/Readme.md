# MerkleTreeAllowlist Contract

A gas-efficient allowlist system using **Merkle Trees** instead of on-chain mappings.

---

## 📘 Overview

The **MerkleTreeAllowlist** contract provides a lightweight way to verify if an address belongs to an allowlist **without storing all addresses on-chain**. This approach uses a **Merkle Tree** to validate proofs of inclusion, drastically reducing gas fees.

---

## ⚙️ Why Not Use a Mapping?

A naive implementation might look like this:

```solidity
mapping(address => bool) public isAllowed;
```

To register 100 addresses, you’d need 100 storage writes (`SSTORE`), costing about **20,000 gas each**:

```text
100 * 20,000 gas = 2,000,000 gas total
```

That’s roughly **$50–$100 USD** depending on gas prices.

---

## 🌳 What Is a Merkle Tree?

A **Merkle Tree** is a cryptographic data structure that lets you verify whether a piece of data (e.g., an address) is part of a dataset **without revealing or storing the entire dataset**.

- **Leaves:** hashed addresses (`keccak256(abi.encodePacked(address))`)
- **Branches:** hashes of two children combined
- **Root:** stored on-chain (`bytes32`)

To verify membership, a user provides a **Merkle Proof** — a set of hashes that allow the contract to reconstruct the root. If it matches the stored root, the user is valid.

---

## 💰 Gas Simulation

| Operation | Description | Approx Gas | Notes |
|------------|--------------|-------------|--------|
| Store 100 addresses in mapping | Each address stored with `SSTORE` | ~2,000,000 gas | 100 × 20,000 |
| Set single Merkle Root | Only one `SSTORE` | ~20,000 gas | Independent of list size |
| Verify Merkle Proof | Proof verification | ~6,000–8,000 gas | Depends on tree depth (log₂n) |

✅ **Result:** Merkle Trees can save **≈99%** of gas compared to naive mappings.

---

## 🧠 Example Workflow

### 1. Off-chain Preparation
- Generate Merkle Tree from your allowlist (using JS/Python toolkits).
- Obtain the **Merkle Root**.
- Store only that root on-chain.

### 2. Verification
- A user submits their address + Merkle Proof.
- The contract reconstructs the root and checks it matches the stored one.

---

## 🔐 Contract Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../../interfaces/MerkleTree/IMerkleTreeAllowList.sol";

contract MerkleTreeAllowlist is Initializable, OwnableUpgradeable, IMerkleTreeAllowList {
    bytes32 public merkleRoot;

    function initialize(address _owner, bytes32 _initialRoot) external initializer {
        __Ownable_init(_owner);
        _transferOwnership(_owner);
        merkleRoot = _initialRoot;
    }

    function isAllowed(address account, bytes32[] calldata proof)
        external
        view
        onlyOwner
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
```

---

## ⚡ Efficiency Comparison

| Method | Storage Size | Register 100 Addresses | Verify Gas | Scalability |
|---------|---------------|------------------------|-------------|--------------|
| Mapping | O(n) | ~2,000,000 | ~2,100 | ❌ Poor |
| Merkle Tree | O(1) | ~20,000 | ~7,000 | ✅ Excellent |

---

## ✅ Conclusion

By replacing traditional mappings with **Merkle Trees**, you:
- Slash gas costs by over **99%**.
- Keep your smart contracts **lightweight and scalable**.
- Maintain **verifiable integrity** using off-chain proofs.

This makes Merkle-based allowlists perfect for NFT mints, token sales, and gated access systems.

---

### 🧩 Off-Chain Merkle Generation Tools
- [merkletreejs](https://github.com/miguelmota/merkletreejs) (JavaScript)
- [pymerkletools](https://github.com/Tierion/pymerkletools) (Python)

---

**License:** MIT
