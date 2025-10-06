// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";
import "../interfaces/IVoterStorage.sol";

contract VoterStorage is IVoterStorage {
    mapping(bytes32 => mapping(address => VoterData)) public poolStorageVoters;
    mapping(bytes32 => bytes32) public poolHashToStorage;
    mapping(bytes32 => bytes32) public storageHashToPool;

    function isPoolHaveVoterStorage(
        bytes32 _poolHash
    ) public view returns (bool isBinded) {
        return poolHashToStorage[_poolHash] != bytes32(0);
    }

    function _vote(
        bytes32 storageLocation,
        address voter,
        uint8 selected
    ) internal {
        if (poolStorageVoters[storageLocation][voter].isVoted) {
            revert AlreadyVoted(
                storageHashToPool[storageLocation],
                storageLocation,
                voter
            );
        }
        poolStorageVoters[storageLocation][voter] = VoterData({
            selected: selected,
            isVoted: true
        });
    }

    function _bind(bytes32 _poolHash, bytes32 _poolStorageHash) internal {
        if (poolHashToStorage[_poolHash] != bytes32(0))
            revert PoolAlreadyExists(_poolHash);
        poolHashToStorage[_poolHash] = _poolStorageHash;
        storageHashToPool[_poolStorageHash] = _poolHash;
        emit PoolBinded(_poolHash, _poolStorageHash);
    }
}
