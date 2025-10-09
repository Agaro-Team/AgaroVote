// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct VotingPoolDataArgument {
    uint256 versioning;
    string title;
    string description;
    bytes32 merkleRootHash;
    bool isPrivate;
    string[] candidates;
    uint8 candidatesTotal;
    VotingPoolExpiry expiry;
}

struct VotingPoolExpiry {
    uint256 startDate;
    uint256 endDate;
}

struct VoteArgument {
    bytes32 poolHash;
    uint8 candidateSelected;
    bytes32[] proofs;
}

struct VoterData {
    uint8 selected;
    bool isVoted;
}

struct PoolData {
    uint256 version;
    address owner;
    bool isPrivate;
    address merkleRootContract;
    bytes32 poolVoterHash;
    uint256[] candidatesVotersCount;
    bytes32 voterStorageHashLocation;
    VotingPoolExpiry expiry;
}
