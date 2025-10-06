// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";

interface IEntryPoint {
    error PoolHashDoesNotExist(bytes32 _poolHash);
    error CandidateDoesNotExist(bytes32 _poolHash, uint8 candidate);
    error PoolDoesNotHaveVoterStorage(bytes32 poolHash);

    event VotingPoolCreated(uint256 indexed version, bytes32 indexed poolHash);

    function newVotingPool(VotingPoolDataArgument calldata _poolData) external;
}
