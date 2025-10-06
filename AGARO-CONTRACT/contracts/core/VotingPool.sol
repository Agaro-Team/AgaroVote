// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";
import "../interfaces/IVotingPool.sol";

contract VotingPool is IVotingPool {
    uint256 public version;
    mapping(bytes32 => PoolData) public pools;

    function isContractValid(
        bytes32 _poolHash
    ) external view returns (bool isExist) {
        return pools[_poolHash].voterStorageHashLocation != bytes32(0);
    }

    function _new(
        bytes32 _poolHash,
        VotingPoolDataArgument memory _poolData
    ) internal returns (bytes32) {
        pools[_poolHash] = PoolData({
            version: version,
            voterStorageHashLocation: keccak256(abi.encode(_poolHash)),
            candidatesVotersCount: new uint256[](_poolData.candidatesTotal),
            owner: _poolData.owner
        });
        version++;
        return _poolHash;
    }
}
