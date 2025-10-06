// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./VotingPool.sol";
import "./VotingPoolDataLib.sol";
import "../interfaces/PackedVotingPoolData.sol";
import "../interfaces/IEntryPoint.sol";

contract EntryPoint is VotingPool, IEntryPoint {
    using VotingPoolDataLib for VotingPoolDataArgument;

    function newVotingPool(VotingPoolDataArgument calldata _poolData) external {
        bytes32 poolHash = _new(_poolData.getHash(version), _poolData);

        emit VotingPoolCreated(version, poolHash);
    }
}
