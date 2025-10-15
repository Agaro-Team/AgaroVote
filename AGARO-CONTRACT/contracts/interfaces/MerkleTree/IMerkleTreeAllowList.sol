// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMerkleTreeAllowlist {
    function isAllowed(
        address account,
        bytes32[] calldata proof
    ) external view returns (bool);
}
