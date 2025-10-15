// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";
import "../../interfaces/voting/IVoterStorage.sol";

contract VoterStorage is IVoterStorage {
    mapping(bytes32 => mapping(address => VoterData)) public pollStorageVoters;
    mapping(bytes32 => bytes32) public pollHashToStorage;
    mapping(bytes32 => bytes32) public storageHashToPoll;

    function isPollHaveVoterStorage(
        bytes32 _pollHash
    ) public view returns (bool isBinded) {
        return pollHashToStorage[_pollHash] != bytes32(0);
    }

    function _vote(
        bytes32 storageLocation,
        address voter,
        uint8 selected
    ) internal {
        if (pollStorageVoters[storageLocation][voter].isVoted)
            revert AlreadyVoted(
                storageHashToPoll[storageLocation],
                storageLocation,
                voter
            );

        pollStorageVoters[storageLocation][voter] = VoterData({
            selected: selected,
            isVoted: true
        });
    }

    function _bind(bytes32 _pollHash, bytes32 _pollStorageHash) internal {
        if (pollHashToStorage[_pollHash] != bytes32(0))
            revert PollAlreadyExists(_pollHash);
        pollHashToStorage[_pollHash] = _pollStorageHash;
        storageHashToPoll[_pollStorageHash] = _pollHash;
        emit PollBinded(_pollHash, _pollStorageHash);
    }
}
