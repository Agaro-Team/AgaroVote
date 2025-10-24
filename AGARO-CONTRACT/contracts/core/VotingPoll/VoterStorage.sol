// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";
import "../../interfaces/VotingPoll/IVoterStorage.sol";

/// @title VoterStorage
/// @notice Manages the relationship between polls and voter data in the AGARO governance system.
/// @dev Handles vote storage, voter verification, and poll binding to storage hashes.
contract VoterStorage is IVoterStorage {
    /// @notice Mapping from voter storage hash to voter data for each poll.
    /// @dev Each poll has a unique voter storage mapping that tracks individual voter records.
    mapping(bytes32 => mapping(address => VoterData)) public pollStorageVoters;

    /// @notice Maps a poll hash to its corresponding voter storage hash.
    /// @dev Used to verify if a poll has an associated storage binding.
    mapping(bytes32 => bytes32) public pollHashToStorage;

    /// @notice Reverse mapping from voter storage hash back to the poll hash.
    /// @dev Ensures bidirectional linking between polls and their storage.
    mapping(bytes32 => bytes32) public storageHashToPoll;

    // -------------------------------------------------------------
    //                        VIEW FUNCTIONS
    // -------------------------------------------------------------

    /// @notice Checks whether a poll has been assigned a voter storage location.
    /// @dev Returns true if the poll is already bound to a voter storage hash.
    /// @param _pollHash The unique identifier (hash) of the poll.
    /// @return isBinded True if the poll has an associated voter storage, false otherwise.
    function isPollHaveVoterStorage(
        bytes32 _pollHash
    ) public view returns (bool isBinded) {
        return pollHashToStorage[_pollHash] != bytes32(0);
    }

    // -------------------------------------------------------------
    //                        INTERNAL FUNCTIONS
    // -------------------------------------------------------------

    /// @notice Records a vote from a specific voter for a given poll.
    /// @dev Reverts if the voter has already voted in this poll.
    /// @param count The total number of votes cast before this one (used as index).
    /// @param storageLocation The storage hash where voter data is stored.
    /// @param voter The address of the voter casting the vote.
    /// @param _voteArgument Struct containing voting parameters such as candidate selection and committed tokens.
    /// @param proof A hash proof representing the voter’s participation.
    function _vote(
        uint256 count,
        bytes32 storageLocation,
        address voter,
        VoteArgument memory _voteArgument,
        bytes32 proof
    ) internal {
        if (pollStorageVoters[storageLocation][voter].isVoted)
            revert AlreadyVoted(
                storageHashToPoll[storageLocation],
                storageLocation,
                voter
            );

        pollStorageVoters[storageLocation][voter] = VoterData({
            index: count,
            selected: _voteArgument.candidateSelected,
            commitedToken: _voteArgument.commitToken,
            proof: proof,
            isVoted: true
        });
    }

    /// @notice Binds a poll to a specific voter storage hash.
    /// @dev Prevents duplicate poll-to-storage assignments and emits a `PollBinded` event on success.
    /// @param _pollHash The unique identifier (hash) of the poll being bound.
    /// @param _pollStorageHash The hash representing the voter storage for this poll.
    function _bind(bytes32 _pollHash, bytes32 _pollStorageHash) internal {
        if (pollHashToStorage[_pollHash] != bytes32(0))
            revert PollAlreadyExists(_pollHash);

        pollHashToStorage[_pollHash] = _pollStorageHash;
        storageHashToPoll[_pollStorageHash] = _pollHash;

        emit PollBinded(_pollHash, _pollStorageHash);
    }
}
