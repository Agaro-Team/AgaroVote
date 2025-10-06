// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../interfaces/PackedVotingPoolData.sol";

library VotingPoolDataLib {
    function encode(
        VotingPoolDataArgument calldata _poolData,
        uint256 version
    ) internal pure returns (bytes memory ret) {
        string memory title = _poolData.title;
        string memory description = _poolData.description;
        uint8 candidates = _poolData.candidates;
        address owner = _poolData.owner;
        return abi.encode(title, description, candidates, owner, version);
    }

    function getHash(
        VotingPoolDataArgument calldata _poolData,
        uint256 version
    ) internal pure returns (bytes32) {
        return keccak256(encode(_poolData, version));
    }
}
