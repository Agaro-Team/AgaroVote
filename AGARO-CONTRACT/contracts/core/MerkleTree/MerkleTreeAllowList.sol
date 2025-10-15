// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../../interfaces/MerkleTree/IMerkleTreeAllowList.sol";

contract MerkleTreeAllowlist is
    Initializable,
    OwnableUpgradeable,
    IMerkleTreeAllowList
{
    bytes32 public merkleRoot;

    function initialize(
        address _owner,
        bytes32 _initialRoot
    ) external initializer {
        __Ownable_init(_owner);
        _transferOwnership(_owner);
        merkleRoot = _initialRoot;
    }

    function isAllowed(
        address account,
        bytes32[] calldata proof
    ) external view onlyOwner returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
