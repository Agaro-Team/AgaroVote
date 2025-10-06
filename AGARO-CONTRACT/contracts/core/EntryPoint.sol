// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./VotingPool.sol";
import "./VotingPoolDataLib.sol";
import "./VoterStorage.sol";
import "../interfaces/PackedVotingPoolData.sol";
import "../interfaces/IEntryPoint.sol";

contract EntryPoint is VotingPool, VoterStorage, IEntryPoint {
    using VotingPoolDataLib for VotingPoolDataArgument;

    function newVotingPool(VotingPoolDataArgument calldata _poolData) external {
        (bytes32 poolHash, bytes32 voterStorageHashLocation) = _new(
            _poolData.getHash(version, msg.sender),
            _poolData,
            msg.sender
        );

        _bind(poolHash, voterStorageHashLocation);

        emit VotingPoolCreated(version, poolHash);
    }

    function vote(VoteArgument calldata _voteData) external {
        bytes32 storageLocation = _verifyVoteData(_voteData);
        _incSelected(
            _voteData.poolHash,
            _voteData.candidateSelected,
            msg.sender
        );
        _vote(storageLocation, msg.sender, _voteData.candidateSelected);

        emit VoteSucceeded(
            _voteData.poolHash,
            msg.sender,
            _voteData.candidateSelected
        );
    }

    function _verifyVoteData(
        VoteArgument memory _voteData
    ) private view returns (bytes32) {
        bytes32 storageLocation = pools[_voteData.poolHash]
            .voterStorageHashLocation;
        uint256 length = pools[_voteData.poolHash].candidatesVotersCount.length;

        if (storageLocation == bytes32(0)) {
            revert PoolHashDoesNotExist(_voteData.poolHash);
        }
        if (length <= _voteData.candidateSelected) {
            revert CandidateDoesNotExist(
                _voteData.poolHash,
                _voteData.candidateSelected
            );
        }
        if (!isPoolHaveVoterStorage(_voteData.poolHash)) {
            revert PoolDoesNotHaveVoterStorage(_voteData.poolHash);
        }

        return pools[_voteData.poolHash].voterStorageHashLocation;
    }
}
