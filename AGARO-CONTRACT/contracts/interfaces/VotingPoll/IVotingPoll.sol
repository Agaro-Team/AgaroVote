// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";

interface IVotingPoll {
    // --- Errors ---
    error PollHashDoesNotExist(bytes32 pollHash);
    error CandidateDoesNotExist(bytes32 _pollHash, uint8 candidate);

    // --- View Functions ---

    /**
     * @notice Retrieve poll details by its unique hash.
     * @param _pollHash The hash identifier of the poll.
     * @return ver Version number of the poll.
     * @return voterStorageHashLocation The hash that links to the poll’s voter storage.
     * @return candidatesVotersCount Array with the vote counts for each candidate.
     * @return owner The creator or owner of the poll.
     */
    function getPollData(
        bytes32 _pollHash
    )
        external
        view
        returns (
            uint256 ver,
            bytes32 voterStorageHashLocation,
            CandidateData[] memory candidatesVotersCount,
            address owner
        );

    /**
     * @notice Check if a poll with a given hash exists and is valid.
     * @param _pollHash The hash identifier of the poll.
     * @return isExist True if the poll exists.
     */
    function isContractValid(
        bytes32 _pollHash
    ) external view returns (bool isExist);

    // --- Internal Logic (Not exposed externally, for inheritance use only) ---
    // function _incSelected(bytes32 _hashPoll, uint8 selected, address voter) external returns (bytes32);
    // function _new(bytes32 _pollHash, VotingPollDataArgument memory _pollData, bool isPrivate, address merkleRootContract, address owner) external returns (bytes32, bytes32);
}
