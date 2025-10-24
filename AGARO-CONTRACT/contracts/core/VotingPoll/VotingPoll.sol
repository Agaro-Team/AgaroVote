// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";
import "../../interfaces/VotingPoll/IVotingPoll.sol";

/// @title VotingPoll
/// @notice Core logic for creating and managing polls within the AGARO governance system.
/// @dev Handles poll storage, version tracking, candidate updates, and data retrieval.
contract VotingPoll is IVotingPoll {
    /// @notice The current version of the poll system.
    /// @dev Incremented automatically whenever a new poll is created.
    uint256 public version;

    /// @notice Mapping of poll identifiers to their associated poll data.
    /// @dev Each poll is uniquely identified by a hash (`_pollHash`).
    mapping(bytes32 => PollData) public polls;

    // -------------------------------------------------------------
    //                        VIEW FUNCTIONS
    // -------------------------------------------------------------

    /// @notice Retrieves complete data for a specific poll.
    /// @dev Reverts if the poll hash does not exist.
    /// @param _pollHash The unique identifier (hash) of the poll.
    /// @return ver The version number associated with the poll.
    /// @return voterStorageHashLocation The storage hash for voter tracking.
    /// @return candidatesVotersCount Array of candidate vote counts and committed tokens.
    /// @return owner The address that created the poll.
    /// @return syntheticRewardContract The synthetic reward contract linked to this poll.
    function getPollData(
        bytes32 _pollHash
    )
        external
        view
        returns (
            uint256 ver,
            bytes32 voterStorageHashLocation,
            CandidateData[] memory candidatesVotersCount,
            address owner,
            address syntheticRewardContract
        )
    {
        if (!isContractValid(_pollHash)) revert PollHashDoesNotExist(_pollHash);

        PollData storage poll = polls[_pollHash];
        return (
            poll.version,
            poll.voterStorageHashLocation,
            poll.candidatesVotersCount,
            poll.owner,
            poll.syntheticRewardContract
        );
    }

    /// @notice Checks if a poll exists in storage.
    /// @dev A poll is considered valid if its voter storage hash is nonzero.
    /// @param _pollHash The hash identifier of the poll to check.
    /// @return isExist True if the poll exists, false otherwise.
    function isContractValid(
        bytes32 _pollHash
    ) public view returns (bool isExist) {
        return polls[_pollHash].voterStorageHashLocation != bytes32(0);
    }

    // -------------------------------------------------------------
    //                     INTERNAL POLL UPDATES
    // -------------------------------------------------------------

    /// @notice Updates the selected candidate’s vote count and committed tokens.
    /// @dev Generates a new poll voter hash after updating the state.
    /// @param _hashPoll The unique hash of the poll.
    /// @param selected The index of the candidate being voted for.
    /// @param commitToken The number of tokens committed by the voter.
    /// @param voter The address of the voter.
    /// @return oldPollVoterHash The previous poll voter hash.
    /// @return newPollVoterHash The updated poll voter hash.
    function _incSelected(
        bytes32 _hashPoll,
        uint8 selected,
        uint256 commitToken,
        address voter
    ) internal returns (bytes32, bytes32) {
        PollData storage poll = polls[_hashPoll];

        poll.candidatesVotersCount[selected].count++;
        poll.candidatesVotersCount[selected].commitToken += commitToken;

        bytes32 newPollVoterHash = keccak256(
            abi.encode(
                voter,
                _hashPoll,
                poll.candidatesVotersCount,
                poll.voterStorageHashLocation,
                poll.pollVoterHash
            )
        );

        bytes32 oldPollVoterHash = poll.pollVoterHash;
        poll.pollVoterHash = newPollVoterHash;

        return (oldPollVoterHash, newPollVoterHash);
    }

    // -------------------------------------------------------------
    //                     INTERNAL POLL CREATION
    // -------------------------------------------------------------

    /// @notice Creates a new poll with the specified configuration.
    /// @dev Generates a unique voter storage hash and stores poll metadata.
    /// @param _pollHash The unique identifier for the new poll.
    /// @param _pollData Struct containing configuration and candidate details.
    /// @param isPrivate Whether the poll is restricted to an allowlist.
    /// @param isTokenRequired Whether voting requires token commitment.
    /// @param merkleRootContract The address of the MerkleTree allowlist contract.
    /// @param syntheticRewardContract The address of the synthetic reward contract.
    /// @param owner The address of the poll creator.
    /// @return pollHash The identifier of the newly created poll.
    /// @return voterStorageHashLocation The unique hash location for voter tracking.
    function _new(
        bytes32 _pollHash,
        VotingPollDataArgument memory _pollData,
        bool isPrivate,
        bool isTokenRequired,
        address merkleRootContract,
        address syntheticRewardContract,
        address owner
    ) internal returns (bytes32 pollHash, bytes32 voterStorageHashLocation) {
        voterStorageHashLocation = keccak256(abi.encode(_pollHash));

        polls[_pollHash] = PollData({
            count: 0,
            version: version,
            owner: owner,
            isPrivate: isPrivate,
            isTokenRequired: isTokenRequired,
            merkleRootContract: merkleRootContract,
            syntheticRewardContract: syntheticRewardContract,
            voterStorageHashLocation: voterStorageHashLocation,
            candidatesVotersCount: new CandidateData[](
                _pollData.candidatesTotal
            ),
            pollVoterHash: bytes32(0),
            expiry: _pollData.expiry
        });

        unchecked {
            version++;
        }

        return (_pollHash, voterStorageHashLocation);
    }
}
