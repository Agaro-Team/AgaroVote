// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";

interface IEntryPoint {
    event VotingPoolCreated(uint256 indexed version, bytes32 indexed poolHash);
    event VoteSucced(
        bytes32 indexed poolHash,
        address indexed voter,
        uint8 selected
    );

    function newVotingPool(VotingPoolDataArgument calldata _poolData) external;
}
