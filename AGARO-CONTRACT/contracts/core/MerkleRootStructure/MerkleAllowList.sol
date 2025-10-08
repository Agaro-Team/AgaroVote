// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "../../interfaces/MerkleRootStructure/IMerkleAllowList.sol";

contract MerkleAllowlist is Ownable, Initializable, IMerkleAllowlist {
    bytes32 public merkleRoot;

    constructor() Ownable(msg.sender) {
        _disableInitializers();
    }

    function initialize(
        address _owner,
        bytes32 initialRoot
    ) external initializer {
        _transferOwnership(_owner);
        merkleRoot = initialRoot;
    }

    function isAllowed(
        address account,
        bytes32[] calldata proof
    ) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
