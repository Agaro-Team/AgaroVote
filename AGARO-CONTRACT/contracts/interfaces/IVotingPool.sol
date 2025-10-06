// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";

interface IVotingPool {
    function isContractValid(
        bytes32 _poolHash
    ) external view returns (bool isExist);
}
