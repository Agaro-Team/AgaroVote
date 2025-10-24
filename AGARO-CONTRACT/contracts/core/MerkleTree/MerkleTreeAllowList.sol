// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../../interfaces/MerkleTree/IMerkleTreeAllowList.sol";

/// @title MerkleTreeAllowlist
/// @notice A Merkle Tree–based allowlist contract used to verify whether an address is permitted.
/// @dev Uses OpenZeppelin's upgradeable pattern and MerkleProof utility.
///      The contract stores a Merkle root representing an off-chain allowlist.
contract MerkleTreeAllowlist is
    Initializable,
    OwnableUpgradeable,
    IMerkleTreeAllowList
{
    /// @notice The Merkle root representing the allowlist.
    /// @dev Each leaf is the `keccak256` hash of an allowed address.
    bytes32 public merkleRoot;

    // -------------------------------------------------------------
    //                         INITIALIZER
    // -------------------------------------------------------------

    /// @notice Initializes the contract with an owner and an initial Merkle root.
    /// @dev This function can only be called once (initializer pattern).
    /// @param _owner The address to be set as the contract owner.
    /// @param _initialRoot The Merkle root representing the allowlist at deployment.
    function initialize(
        address _owner,
        bytes32 _initialRoot
    ) external initializer {
        __Ownable_init(_owner);
        _transferOwnership(_owner);
        merkleRoot = _initialRoot;
    }

    // -------------------------------------------------------------
    //                         VIEW FUNCTIONS
    // -------------------------------------------------------------

    /// @notice Verifies whether a given address is in the Merkle allowlist.
    /// @dev Uses the provided Merkle proof to confirm that the leaf (hashed address)
    ///      exists within the stored Merkle root. Only callable by the contract owner.
    /// @param account The address being verified against the allowlist.
    /// @param proof The Merkle proof used to validate membership.
    /// @return isAllowed True if the address is part of the Merkle tree, false otherwise.
    function isAllowed(
        address account,
        bytes32[] calldata proof
    ) external view onlyOwner returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
