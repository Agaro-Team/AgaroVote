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
    uint256 rewardShare;
    bool isTokenRequired;
}

struct VotingPollExpiry {
    uint256 startDate;
    uint256 endDate;
}

struct VoteArgument {
    bytes32 pollHash;
    uint8 candidateSelected;
    bytes32[] proofs;
    uint256 commitToken;
}

struct VoterData {
    uint8 selected;
    uint256 commitedToken;
    bool isVoted;
}

struct PollData {
    uint256 version;
    address owner;
    bool isPrivate;
    address merkleRootContract;
    address syntheticRewardContract;
    bytes32 pollVoterHash;
    CandidateData[] candidatesVotersCount;
    bytes32 voterStorageHashLocation;
    VotingPollExpiry expiry;
    bool isTokenRequired;
}

struct CandidateData {
    uint256 count;
    uint256 commitToken;
}