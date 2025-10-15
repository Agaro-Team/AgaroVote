// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";

interface IVoterStorage {
    // --- Events ---
    event PollBinded(bytes32 indexed pollHash, bytes32 pollStorageLocationHash);
    
    // --- Errors ---
    error PollAlreadyExists(bytes32 pollHash);
    error PollDoesNotHaveVoterStorage(bytes32 pollHash);
    error AlreadyVoted(bytes32 pollHash, bytes32 storageHash, address voter);

    // --- Views ---
    /**
     * @notice Check if a poll has an associated voter storage.
     * @param _pollHash The hash identifying the poll.
     * @return isBinded True if the poll is already bound to a voter storage.
     */
    function isPollHaveVoterStorage(
        bytes32 _pollHash
    ) external view returns (bool isBinded);

    // --- Core Logic (Internal in implementation, but useful for inheritance) ---
    /**
     * @notice Record a vote for a voter in a given poll storage.
     * @dev Implemented as internal in the main contract; here for inheritance reference.
     * @param storageLocation The hash identifying the poll storage.
     * @param voter Address of the voter.
     * @param selected The index of the selected candidate.
     */
    // function _vote(bytes32 storageLocation, address voter, uint8 selected) external;

    /**
     * @notice Bind a poll hash to its voter storage hash.
     * @dev Implemented as internal in main contract; shown here for clarity.
     * @param _pollHash The hash of the poll.
     * @param _pollStorageHash The hash of the poll’s voter storage.
     */
    // function _bind(bytes32 _pollHash, bytes32 _pollStorageHash) external;
}
