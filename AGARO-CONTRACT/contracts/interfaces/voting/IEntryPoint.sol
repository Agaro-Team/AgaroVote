// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";

interface IEntryPoint {
    event VotingPollCreated(
        uint256 indexed version,
        bytes32 indexed pollHash,
        bytes32 voterStorageHashLocation,
        uint256[] candidateCount
    );
    event VoteSucceeded(
        bytes32 indexed pollHash,
        address indexed voter,
        uint8 selected,
        bytes32 newPollVoterHash
    );

    error AddressIsNotAllowed(address voter, bytes32 pollHash);
    error VersioningError(uint256 version);
    error VotingIsNotActive(
        bytes32 pollHash,
        uint256 startDate,
        uint256 endData
    );

    function newVotingPoll(VotingPollDataArgument calldata _pollData) external;
}
