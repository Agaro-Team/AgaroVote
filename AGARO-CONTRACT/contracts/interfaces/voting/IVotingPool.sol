// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";

interface IVotingPool {
    error PoolHashDoesNotExist(bytes32 poolHash);
    error CandidateDoesNotExist(bytes32 _poolHash, uint8 candidate);

    function isContractValid(
        bytes32 _poolHash
    ) external view returns (bool isExist);
}
