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

struct BaseIncentives {
    uint256 tier1;
    uint256 tier5;
    uint256 tier10;
}

struct VoteArgument {
    bytes32 pollHash;
    uint8 candidateSelected;
    bytes32[] proofs;
    uint256 commitToken;
}

struct Tier {
    uint8 discount;
    uint256 maxPollingPerDay;
    uint256 minHoldAGR;
}

struct UserPollData {
    uint256 lastResetTime;
    uint256 pollsCreated;
}

struct VoterData {
    uint256 index;
    bytes32 proof;
    uint8 selected;
    uint256 commitedToken;
    bool isVoted;
}
struct AdminData {
    address admin;
    bool isAdminAgreed;
}

struct PollData {
    uint256 version;
    address owner;
    bool isPrivate;
    address merkleRootContract;
    address syntheticRewardContract;
    bytes32 pollVoterHash;
    CandidateData[] candidatesVotersCount;
    uint256 count;
    bytes32 voterStorageHashLocation;
    VotingPollExpiry expiry;
    bool isTokenRequired;
}

struct CandidateData {
    uint256 count;
    uint256 commitToken;
}
