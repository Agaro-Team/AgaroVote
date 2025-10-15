// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct VotingPollDataArgument {
    uint256 versioning;
    string title;
    string description;
    bytes32 merkleRootHash;
    bool isPrivate;
    string[] candidates;
    uint8 candidatesTotal;
    VotingPollExpiry expiry;
}

struct VotingPollExpiry {
    uint256 startDate;
    uint256 endDate;
}

struct VoteArgument {
    bytes32 pollHash;
    uint8 candidateSelected;
    bytes32[] proofs;
}

struct VoterData {
    uint8 selected;
    bool isVoted;
}

struct PollData {
    uint256 version;
    address owner;
    bool isPrivate;
    address merkleRootContract;
    bytes32 pollVoterHash;
    uint256[] candidatesVotersCount;
    bytes32 voterStorageHashLocation;
    VotingPollExpiry expiry;
}
