// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";

interface IEntryPoint {
    event VotingPoolCreated(uint256 indexed version, bytes32 indexed poolHash);
    event VoteSucceeded(
        bytes32 indexed poolHash,
        address indexed voter,
        uint8 selected,
        bytes32 newPoolVoterHash
    );

    function newVotingPool(VotingPoolDataArgument calldata _poolData) external;
}
