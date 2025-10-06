// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct VotingPoolDataArgument {
    string title;
    string description;
    string[] candidates;
    uint8 candidatesTotal;
}

struct VoteArgument {
    bytes32 poolHash;
    uint8 candidateSelected;
}

struct PoolData {
    uint256 version;
    bytes32 voterStorageHashLocation;
    uint256[] candidatesVotersCount;
    address owner;
}
