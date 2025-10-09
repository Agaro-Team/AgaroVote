// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./VotingPool.sol";
import "./VoterStorage.sol";
import "../MerkleRootStructure/MerkleAllowList.sol";
import "../../lib/VotingPoolDataArgumentLib.sol";
import "../../interfaces/voting/IEntryPoint.sol";

contract EntryPoint is VotingPool, VoterStorage, IEntryPoint {
    using VotingPoolDataLib for VotingPoolDataArgument;
    using Clones for address;

    address public immutable merkleAllowListImplementation;

    constructor(address _merkleAllowListImplementation) {
        merkleAllowListImplementation = _merkleAllowListImplementation;
    }

    function newVotingPool(VotingPoolDataArgument calldata _poolData) external {
        if (_poolData.versioning != version) revert VersioningError(_poolData.versioning);

        address merkleRootContract = address(0);

        if (_poolData.merkleRootHash != bytes32(0))
            merkleRootContract = createMerkleAllowlist(
                _poolData.merkleRootHash
            );

        (bytes32 poolHash, bytes32 voterStorageHashLocation) = _new(
            _poolData.getHash(version, msg.sender),
            _poolData,
            _poolData.isPrivate,
            merkleRootContract,
            msg.sender
        );

        _bind(poolHash, voterStorageHashLocation);

        if (!_poolData.isPrivate) emit VotingPoolCreated(version, poolHash);
    }

    function vote(VoteArgument calldata _voteData) external {
        bytes32 storageLocation = _verifyVoteData(_voteData);

        PoolData memory poolData = pools[_voteData.poolHash];
        address cont = poolData.merkleRootContract;
        if (cont != address(0))
            _verifyAddressWithProof(
                cont,
                _voteData.proofs,
                _voteData.poolHash,
                msg.sender
            );

        if (
            block.timestamp < poolData.expiry.startDate ||
            block.timestamp > poolData.expiry.endDate
        )
            revert VotingIsNotActive(
                _voteData.poolHash,
                poolData.expiry.startDate,
                poolData.expiry.endDate
            );

        bytes32 newPoolVoterHash = _incSelected(
            _voteData.poolHash,
            _voteData.candidateSelected,
            msg.sender
        );

        _vote(storageLocation, msg.sender, _voteData.candidateSelected);

        emit VoteSucceeded(
            _voteData.poolHash,
            msg.sender,
            _voteData.candidateSelected,
            newPoolVoterHash
        );
    }

    function _verifyVoteData(
        VoteArgument memory _voteData
    ) private view returns (bytes32) {
        bytes32 storageLocation = pools[_voteData.poolHash]
            .voterStorageHashLocation;
        uint256 length = pools[_voteData.poolHash].candidatesVotersCount.length;

        if (storageLocation == bytes32(0))
            revert PoolHashDoesNotExist(_voteData.poolHash);

        if (length <= _voteData.candidateSelected)
            revert CandidateDoesNotExist(
                _voteData.poolHash,
                _voteData.candidateSelected
            );

        if (!isPoolHaveVoterStorage(_voteData.poolHash))
            revert PoolDoesNotHaveVoterStorage(_voteData.poolHash);

        return pools[_voteData.poolHash].voterStorageHashLocation;
    }

    function createMerkleAllowlist(
        bytes32 root
    ) private returns (address newClone) {
        newClone = merkleAllowListImplementation.clone();
        MerkleAllowlist(newClone).initialize(address(this), root);
    }

    function _verifyAddressWithProof(
        address cont,
        bytes32[] memory proofs,
        bytes32 poolHash,
        address voter
    ) private view returns (bool) {
        bool isAllowed = IMerkleAllowlist(cont).isAllowed(msg.sender, proofs);

        if (!isAllowed) revert AddressIsNotAllowed(voter, poolHash);

        return isAllowed;
    }
}
