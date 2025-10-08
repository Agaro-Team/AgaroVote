// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../structs.sol";

library VotingPoolDataLib {
    function encode(
        VotingPoolDataArgument calldata _poolData,
        uint256 version,
        address owner
    ) internal pure returns (bytes memory ret) {
        string memory title = _poolData.title;
        string memory description = _poolData.description;
        string[] memory candidates = _poolData.candidates;
        uint8 candidatesTotal = _poolData.candidatesTotal;
        return
            abi.encode(
                title,
                description,
                candidates,
                candidatesTotal,
                version,
                owner
            );
    }

    function getHash(
        VotingPoolDataArgument calldata _poolData,
        uint256 version,
        address owner
    ) internal pure returns (bytes32) {
        return keccak256(encode(_poolData, version, owner));
    }
}
