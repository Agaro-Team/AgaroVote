// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";
import "../../interfaces/voting/IVotingPool.sol";

contract VotingPool is IVotingPool {
    uint256 public version;
    mapping(bytes32 => PoolData) public pools;

    function getPoolData(
        bytes32 _poolHash
    )
        external
        view
        returns (
            uint256 ver,
            bytes32 voterStorageHashLocation,
            uint256[] memory candidatesVotersCount,
            address owner
        )
    {
        if (!isContractValid(_poolHash)) revert PoolHashDoesNotExist(_poolHash);

        PoolData storage pool = pools[_poolHash];
        return (
            pool.version,
            pool.voterStorageHashLocation,
            pool.candidatesVotersCount,
            pool.owner
        );
    }

    function isContractValid(
        bytes32 _poolHash
    ) public view returns (bool isExist) {
        return pools[_poolHash].voterStorageHashLocation != bytes32(0);
    }

    function _incSelected(
        bytes32 _hashPool,
        uint8 selected,
        address voter
    ) internal returns (bytes32) {
        PoolData storage pool = pools[_hashPool];

        pool.candidatesVotersCount[selected]++;
        bytes32 newPoolVoterHash = keccak256(
            abi.encode(
                voter,
                _hashPool,
                pool.candidatesVotersCount,
                pool.voterStorageHashLocation
            )
        );
        pool.poolVoterHash = newPoolVoterHash;
        return newPoolVoterHash;
    }

    function _new(
        bytes32 _poolHash,
        VotingPoolDataArgument memory _poolData,
        bool isPrivate,
        address merkleRootContract,
        address owner
    ) internal returns (bytes32, bytes32) {
        bytes32 voterStorageHashLocation = keccak256(abi.encode(_poolHash));
        pools[_poolHash] = PoolData({
            version: version,
            owner: owner,
            isPrivate: isPrivate,
            merkleRootContract: merkleRootContract,
            voterStorageHashLocation: voterStorageHashLocation,
            candidatesVotersCount: new uint256[](_poolData.candidatesTotal),
            poolVoterHash: bytes32(0),
            expiry: _poolData.expiry
        });
        unchecked {
            version++;
        }
        return (_poolHash, voterStorageHashLocation);
    }
}
