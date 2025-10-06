// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";

interface IVoterStorage {
    error PoolAlreadyExists(bytes32 poolHash);
    event PoolBinded(bytes32 indexed poolHash, bytes32 poolStorageHash);
}
