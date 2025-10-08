// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMerkleAllowlist {
    function isAllowed(
        address account,
        bytes32[] calldata proof
    ) external view returns (bool);
}
