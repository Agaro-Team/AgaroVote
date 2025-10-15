// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";

interface IVoterStorage {
    event PollBinded(bytes32 indexed pollHash, bytes32 pollStorageLocationHash);

    error PollAlreadyExists(bytes32 pollHash);
    error PollDoesNotHaveVoterStorage(bytes32 pollHash);
    error AlreadyVoted(bytes32 pollHash, bytes32 storageHash, address voter);
}
