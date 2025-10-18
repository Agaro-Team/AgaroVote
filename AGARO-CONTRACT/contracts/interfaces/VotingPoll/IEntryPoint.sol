// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../lib/VotingPollDataArgumentLib.sol";

interface IEntryPoint {
    // --- Events ---
    event VotingPollCreated(
        uint256 indexed version,
        bytes32 indexed pollHash,
        bytes32 voterStorageHashLocation,
        uint256[] candidateCount
    );
    event VoteSucceeded(
        bytes32 indexed pollHash,
        uint8 selected,
        uint256 commitToken,
        bytes32 newPollVoterHash,
        address indexed voter
    );
    event WithdrawSucceeded(
        bytes32 indexed pollHash,
        uint256 withdrawedToken,
        uint256 withdrawedReward,
        address indexed voter
    );

    // --- Errors ---
    error AddressIsNotAllowed(address voter, bytes32 pollHash);
    error VersioningError(uint256 version);
    error SenderIsNotVoterOf(bytes32 pollHash, address sender);
    error insufficientBalance(address creator);
    error PollNeedsCommitToken(bytes32 pollHash, uint256 commitToken);
    error VotingIsNotActive(
        bytes32 pollHash,
        uint256 startDate,
        uint256 endData
    );

    // --- Core Functions ---

    /**
     * @notice Creates a new voting poll with given parameters.
     * @param _pollData Struct containing all configuration for the poll.
     */
    function newVotingPoll(VotingPollDataArgument calldata _pollData) external;

    /**
     * @notice Cast a vote in a poll.
     * @param _voteData Struct containing the poll hash, selected candidate, and Merkle proofs if required.
     */
    function vote(VoteArgument calldata _voteData) external;

    /**
     * @notice Withdraw commited and reward tokens.
     * @param _pollHash hash of voting poll.
     */
    function withdraw(bytes32 _pollHash) external;
    // --- View Helpers (optional) ---

    /**
     * @notice Verifies an address is part of the Merkle allowlist for a poll.
     * @dev Returns true if address is allowed, false otherwise.
     */
    // function _verifyAddressWithProof(
    //     address cont,
    //     bytes32[] memory proofs,
    //     bytes32 pollHash,
    //     address voter
    // ) external view returns (bool);
}
