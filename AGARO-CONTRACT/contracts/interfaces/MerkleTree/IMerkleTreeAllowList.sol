// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMerkleTreeAllowList {
    // --- Events ---
    event MerkleRootUpdated(bytes32 indexed newRoot);

    // --- Errors ---
    error InvalidProof(address account);
    error NotAuthorized(address caller);

    // --- Views ---
    /**
     * @notice Returns true if the given account is part of the Merkle tree.
     * @dev Typically verified using a Merkle proof generated off-chain.
     * @param account The address to verify.
     * @param proof The Merkle proof array.
     * @return isValid True if the address is included in the Merkle root.
     */
    function isAllowed(
        address account,
        bytes32[] calldata proof
    ) external view returns (bool isValid);

    /**
     * @notice Returns the current Merkle root hash.
     */
    function merkleRoot() external view returns (bytes32);

    // --- Initialization ---
    /**
     * @notice Initialize the contract with an owner and an initial Merkle root.
     * @param _owner The address of the contract owner.
     * @param initialRoot The initial Merkle root to set.
     */
    function initialize(address _owner, bytes32 initialRoot) external;
}
