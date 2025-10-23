// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./VotingPoll.sol";
import "./VoterStorage.sol";
import "../Security.sol";
import "../MerkleTree/MerkleTreeAllowList.sol";
import "../SyntheticReward/SyntheticReward.sol";
import "../../lib/VotingPollDataArgumentLib.sol";
import "../../interfaces/ERC20-AGR/IAGR.sol";
import "../../interfaces/MerkleTree/IMerkleTreeAllowList.sol";
import "../../interfaces/SyntheticReward/ISyntheticReward.sol";
import "../../interfaces/VotingPoll/IEntryPoint.sol";

contract EntryPoint is VotingPoll, VoterStorage, IEntryPoint, Security {
    // using SafeERC20 for IERC20;
    using VotingPollDataLib for VotingPollDataArgument;
    using Clones for address;

    address public immutable merkleTreeAllowListImplementation;
    address public immutable syntheticRewardImplementation;
    IAGARO public immutable token;

    constructor(
        address _merkleTreeAllowListImplementation,
        address _syntheticRewardImplementation,
        address _token
    ) {
        merkleTreeAllowListImplementation = _merkleTreeAllowListImplementation;
        syntheticRewardImplementation = _syntheticRewardImplementation;
        token = IAGARO(_token);
        admin.push(AdminData({admin: msg.sender, isAdminAgreed: false}));
    }

    function newVotingPoll(
        VotingPollDataArgument calldata _pollData
    ) external systemActive {
        if (_pollData.versioning != version)
            revert VersioningError(_pollData.versioning);

        address syntheticRewardContract = _initSyntheticRewardContract(
            _pollData.rewardShare,
            _pollData.expiry,
            msg.sender
        );
        (bytes32 pollHash, bytes32 voterStorageHashLocation) = _new(
            _pollData.getHash(version, msg.sender),
            _pollData,
            _pollData.isPrivate,
            _pollData.isTokenRequired,
            _initMerkleRootContract(_pollData.merkleRootHash),
            syntheticRewardContract,
            msg.sender
        );

        _bind(pollHash, voterStorageHashLocation);

        if (!_pollData.isPrivate)
            emit VotingPollCreated(
                version,
                pollHash,
                voterStorageHashLocation,
                syntheticRewardContract,
                new uint256[](_pollData.candidatesTotal)
            );
    }

    function vote(VoteArgument calldata _voteData) external systemActive {
        bytes32 storageLocation = _verifyVoteData(_voteData);
        PollData memory pollData = polls[_voteData.pollHash];
        _verifyVoterCredential(pollData, _voteData, msg.sender);

        (bytes32 oldPollVoterHash, bytes32 newPollVoterHash) = _incSelected(
            _voteData.pollHash,
            _voteData.candidateSelected,
            _voteData.commitToken,
            msg.sender
        );

        _vote(
            pollData.count,
            storageLocation,
            msg.sender,
            _voteData,
            oldPollVoterHash
        );
        pollData.count++;
        emit VoteSucceeded(
            _voteData.pollHash,
            _voteData.candidateSelected,
            _voteData.commitToken,
            newPollVoterHash,
            msg.sender
        );
    }

    function commitSecurity(uint256 amountToCommit) public nonReentrant {
        token.transferFrom(msg.sender, address(this), amountToCommit);
        _commitSecurity(amountToCommit);
    }

    function withdraw(bytes32 _pollHash) external systemActive {
        PollData memory pollData = polls[_pollHash];

        if (
            !pollStorageVoters[pollData.voterStorageHashLocation][msg.sender]
                .isVoted
        ) {
            revert SenderIsNotVoterOf(_pollHash, msg.sender);
        }

        (uint256 rewards, uint256 principalToken) = ISyntheticReward(
            pollData.syntheticRewardContract
        ).withdraw(msg.sender);

        emit WithdrawSucceeded(_pollHash, principalToken, rewards, msg.sender);
    }

    function withdrawSecurity() public nonReentrant {
        uint256 amountToTransfer = _withdrawSecurity(msg.sender);
        token.transfer(msg.sender, amountToTransfer);
    }

    function _verifyVoteData(
        VoteArgument memory _voteData
    ) private view returns (bytes32) {
        bytes32 storageLocation = polls[_voteData.pollHash]
            .voterStorageHashLocation;
        uint256 length = polls[_voteData.pollHash].candidatesVotersCount.length;

        if (storageLocation == bytes32(0))
            revert PollHashDoesNotExist(_voteData.pollHash);

        if (length <= _voteData.candidateSelected)
            revert CandidateDoesNotExist(
                _voteData.pollHash,
                _voteData.candidateSelected
            );

        if (!isPollHaveVoterStorage(_voteData.pollHash))
            revert PollDoesNotHaveVoterStorage(_voteData.pollHash);

        return storageLocation;
    }

    function _verifyVoterCredential(
        PollData memory _pollData,
        VoteArgument memory _voteData,
        address voter
    ) private {
        address cont = _pollData.merkleRootContract;
        if (cont != address(0))
            _verifyAddressWithProof(
                cont,
                _voteData.proofs,
                _voteData.pollHash,
                voter
            );

        if (
            block.timestamp < _pollData.expiry.startDate ||
            block.timestamp > _pollData.expiry.endDate
        )
            revert VotingIsNotActive(
                _voteData.pollHash,
                _pollData.expiry.startDate,
                _pollData.expiry.endDate
            );

        if (_pollData.isTokenRequired && _voteData.commitToken == uint256(0))
            revert PollNeedsCommitToken(
                _voteData.pollHash,
                _voteData.commitToken
            );

        if (_voteData.commitToken > 0) {
            ISyntheticReward(_pollData.syntheticRewardContract).commit(
                _voteData.commitToken,
                voter
            );
        }
    }

    function _createMerkleAllowlist(
        bytes32 root
    ) private returns (address newClone) {
        newClone = merkleTreeAllowListImplementation.clone();
        MerkleTreeAllowlist(newClone).initialize(address(this), root);
    }

    function _initMerkleRootContract(
        bytes32 merkleRootHash
    ) private returns (address) {
        address merkleRootContract = address(0);

        if (merkleRootHash != bytes32(0))
            merkleRootContract = _createMerkleAllowlist(merkleRootHash);

        return merkleRootContract;
    }

    function _addAdditionalReward(
        uint256 rewardShare,
        uint256 creatorBalances
    ) private pure returns (uint256, uint256) {
        uint256 bonus = 0;
        if (creatorBalances >= 10_000 * 1e18) {
            bonus = 110 * 1e18;
        } else if (creatorBalances >= 50_00_0 * 1e18) {
            bonus = 60 * 1e18;
        } else if (creatorBalances >= 25_000 * 1e18) {
            bonus = 30 * 1e18;
        } else if (creatorBalances >= 10_000 * 1e18) {
            bonus = 15 * 1e18;
        } else if (creatorBalances >= 5_000 * 1e18) {
            bonus = 10 * 1e18;
        }

        return (rewardShare, bonus);
    }

    function _createSyntheticReward(
        uint256 rewardShare,
        VotingPollExpiry memory expiry
    ) private returns (address newClone) {
        newClone = syntheticRewardImplementation.clone();
        uint256 duration = expiry.endDate - expiry.startDate;
        SyntheticReward(newClone).initialize(
            address(this),
            address(token),
            duration,
            rewardShare
        );
    }

    function _initSyntheticRewardContract(
        uint256 rewardShare,
        VotingPollExpiry memory expiry,
        address creator
    ) private returns (address) {
        address rewardContract = address(0);
        uint256 creatorBalances = token.balanceOf(creator);
        if (creatorBalances < rewardShare) {
            revert insufficientBalance(creator);
        }
        (uint256 reward, uint256 bonus) = _addAdditionalReward(
            rewardShare,
            creatorBalances
        );

        uint256 total = reward + bonus;
        if (total > 0) {
            rewardContract = _createSyntheticReward(total, expiry);

            token.transferFrom(creator, rewardContract, rewardShare);
            if (bonus > 0) {
                token.mint(rewardContract, bonus);
            }
        }

        return rewardContract;
    }

    function _verifyAddressWithProof(
        address cont,
        bytes32[] memory proofs,
        bytes32 pollHash,
        address voter
    ) private view returns (bool) {
        bool isAllowed = IMerkleTreeAllowList(cont).isAllowed(
            msg.sender,
            proofs
        );

        if (!isAllowed) revert AddressIsNotAllowed(voter, pollHash);

        return isAllowed;
    }
}
