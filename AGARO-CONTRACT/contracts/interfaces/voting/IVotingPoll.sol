// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";

interface IVotingPoll {
    error PollHashDoesNotExist(bytes32 pollHash);
    error CandidateDoesNotExist(bytes32 _pollHash, uint8 candidate);

    function isContractValid(
        bytes32 _pollHash
    ) external view returns (bool isExist);
}
