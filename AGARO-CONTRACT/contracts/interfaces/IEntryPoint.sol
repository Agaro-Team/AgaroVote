// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";

interface IEntryPoint {
    event VotingPoolCreated(uint256 indexed version, bytes32 indexed poolHash);

    function newVotingPool(VotingPoolDataArgument calldata _poolData) external;
}
