// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../structs.sol";

library VotingPollDataLib {
    function encode(
        VotingPollDataArgument calldata _pollData,
        uint256 version,
        address owner
    ) internal pure returns (bytes memory ret) {
        string memory title = _pollData.title;
        string memory description = _pollData.description;
        string[] memory candidates = _pollData.candidates;
        uint8 candidatesTotal = _pollData.candidatesTotal;
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
        VotingPollDataArgument calldata _pollData,
        uint256 version,
        address owner
    ) internal pure returns (bytes32) {
        return keccak256(encode(_pollData, version, owner));
    }
}
