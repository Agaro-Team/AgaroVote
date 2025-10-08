// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";

interface IVoterStorage {
    event PoolBinded(bytes32 indexed poolHash, bytes32 poolStorageHash);

    error PoolAlreadyExists(bytes32 poolHash);
    error PoolDoesNotHaveVoterStorage(bytes32 poolHash);
    error AlreadyVoted(bytes32 poolHash, bytes32 storageHash, address voter);
}
