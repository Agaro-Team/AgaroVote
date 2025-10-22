// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../structs.sol";
import "../../interfaces/VotingPoll/IVotingPoll.sol";

contract VotingPoll is IVotingPoll {
    uint256 public version;
    mapping(bytes32 => PollData) public polls;

    function getPollData(
        bytes32 _pollHash
    )
        external
        view
        returns (
            uint256 ver,
            bytes32 voterStorageHashLocation,
            CandidateData[] memory candidatesVotersCount,
            address owner,
            address syntheticRewardContract
        )
    {
        if (!isContractValid(_pollHash)) revert PollHashDoesNotExist(_pollHash);

        PollData storage poll = polls[_pollHash];
        return (
            poll.version,
            poll.voterStorageHashLocation,
            poll.candidatesVotersCount,
            poll.owner,
            poll.syntheticRewardContract
        );
    }

    function isContractValid(
        bytes32 _pollHash
    ) public view returns (bool isExist) {
        return polls[_pollHash].voterStorageHashLocation != bytes32(0);
    }

    function _incSelected(
        bytes32 _hashPoll,
        uint8 selected,
        uint256 commitToken,
        address voter
    ) internal returns (bytes32, bytes32) {
        PollData storage poll = polls[_hashPoll];

        poll.candidatesVotersCount[selected].count++;
        poll.candidatesVotersCount[selected].count += commitToken;
        bytes32 newPollVoterHash = keccak256(
            abi.encode(
                voter,
                _hashPoll,
                poll.candidatesVotersCount,
                poll.voterStorageHashLocation,
                poll.pollVoterHash
            )
        );
        bytes32 oldPollVoterHash = poll.pollVoterHash;
        poll.pollVoterHash = newPollVoterHash;
        return (oldPollVoterHash, newPollVoterHash);
    }

    function _new(
        bytes32 _pollHash,
        VotingPollDataArgument memory _pollData,
        bool isPrivate,
        bool isTokenRequired,
        address merkleRootContract,
        address syntheticRewardContract,
        address owner
    ) internal returns (bytes32, bytes32) {
        bytes32 voterStorageHashLocation = keccak256(abi.encode(_pollHash));
        polls[_pollHash] = PollData({
            count: 0,
            version: version,
            owner: owner,
            isPrivate: isPrivate,
            isTokenRequired: isTokenRequired,
            merkleRootContract: merkleRootContract,
            syntheticRewardContract: syntheticRewardContract,
            voterStorageHashLocation: voterStorageHashLocation,
            candidatesVotersCount: new CandidateData[](
                _pollData.candidatesTotal
            ),
            pollVoterHash: bytes32(0),
            expiry: _pollData.expiry
        });
        unchecked {
            version++;
        }
        return (_pollHash, voterStorageHashLocation);
    }
}
