// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

struct VotingPoolDataArgument {
    string title;
    string description;
    uint8 candidates;
    address owner;
}

struct PoolData {
    uint256 version;
    bytes32 voterStorageHashLocation;
    uint8[] candidates;
    address owner;
}
