// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";

interface IVotingPool {
    error PoolDoesNotExists(bytes32 poolHash);

    function isContractValid(
        bytes32 _poolHash
    ) external view returns (bool isExist);
}
