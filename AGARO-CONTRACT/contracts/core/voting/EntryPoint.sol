// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./VotingPoll.sol";
import "./VoterStorage.sol";
import "../../interfaces/MerkleTree/IMerkleTreeAllowList.sol";
import "../MerkleTree/MerkleTreeAllowList.sol";
import "../../lib/VotingPollDataArgumentLib.sol";
import "../../interfaces/voting/IEntryPoint.sol";

contract EntryPoint is VotingPoll, VoterStorage, IEntryPoint {
    using VotingPollDataLib for VotingPollDataArgument;
    using Clones for address;

    address public immutable merkleTreeAllowListImplementation;

    constructor(address _merkleTreeAllowListImplementation) {
        merkleTreeAllowListImplementation = _merkleTreeAllowListImplementation;
    }

    function newVotingPoll(VotingPollDataArgument calldata _pollData) external {
        if (_pollData.versioning != version)
            revert VersioningError(_pollData.versioning);

        address merkleRootContract = address(0);

        if (_pollData.merkleRootHash != bytes32(0))
            merkleRootContract = createMerkleAllowlist(
                _pollData.merkleRootHash
            );

        (bytes32 pollHash, bytes32 voterStorageHashLocation) = _new(
            _pollData.getHash(version, msg.sender),
            _pollData,
            _pollData.isPrivate,
            merkleRootContract,
            msg.sender
        );

        _bind(pollHash, voterStorageHashLocation);

        if (!_pollData.isPrivate)
            emit VotingPollCreated(
                version,
                pollHash,
                voterStorageHashLocation,
                new uint256[](_pollData.candidatesTotal)
            );
    }

    function vote(VoteArgument calldata _voteData) external {
        bytes32 storageLocation = _verifyVoteData(_voteData);

        PollData memory pollData = polls[_voteData.pollHash];
        address cont = pollData.merkleRootContract;
        if (cont != address(0))
            _verifyAddressWithProof(
                cont,
                _voteData.proofs,
                _voteData.pollHash,
                msg.sender
            );

        if (
            block.timestamp < pollData.expiry.startDate ||
            block.timestamp > pollData.expiry.endDate
        )
            revert VotingIsNotActive(
                _voteData.pollHash,
                pollData.expiry.startDate,
                pollData.expiry.endDate
            );

        bytes32 newPollVoterHash = _incSelected(
            _voteData.pollHash,
            _voteData.candidateSelected,
            msg.sender
        );

        _vote(storageLocation, msg.sender, _voteData.candidateSelected);

        emit VoteSucceeded(
            _voteData.pollHash,
            msg.sender,
            _voteData.candidateSelected,
            newPollVoterHash
        );
    }

    function _verifyVoteData(
        VoteArgument memory _voteData
    ) private view returns (bytes32) {
        bytes32 storageLocation = polls[_voteData.pollHash]
            .voterStorageHashLocation;
        uint256 length = polls[_voteData.pollHash].candidatesVotersCount.length;

        if (storageLocation == bytes32(0))
            revert PollHashDoesNotExist(_voteData.pollHash);

        if (length <= _voteData.candidateSelected)
            revert CandidateDoesNotExist(
                _voteData.pollHash,
                _voteData.candidateSelected
            );

        if (!isPollHaveVoterStorage(_voteData.pollHash))
            revert PollDoesNotHaveVoterStorage(_voteData.pollHash);

        return polls[_voteData.pollHash].voterStorageHashLocation;
    }

    function createMerkleAllowlist(
        bytes32 root
    ) private returns (address newClone) {
        newClone = merkleTreeAllowListImplementation.clone();
        MerkleTreeAllowlist(newClone).initialize(address(this), root);
    }

    function _verifyAddressWithProof(
        address cont,
        bytes32[] memory proofs,
        bytes32 pollHash,
        address voter
    ) private view returns (bool) {
        bool isAllowed = IMerkleTreeAllowlist(cont).isAllowed(
            msg.sender,
            proofs
        );

        if (!isAllowed) revert AddressIsNotAllowed(voter, pollHash);

        return isAllowed;
    }
}
