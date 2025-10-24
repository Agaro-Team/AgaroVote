// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./VotingPoll.sol";
import "./VoterStorage.sol";
import "../Security.sol";
import "../AgaroTierSystem.sol";
import "../MerkleTree/MerkleTreeAllowList.sol";
import "../SyntheticReward/SyntheticReward.sol";
import "../../lib/VotingPollDataArgumentLib.sol";
import "../../interfaces/ERC20-AGR/IAGR.sol";
import "../../interfaces/MerkleTree/IMerkleTreeAllowList.sol";
import "../../interfaces/SyntheticReward/ISyntheticReward.sol";
import "../../interfaces/VotingPoll/IEntryPoint.sol";

contract EntryPoint is
    VotingPoll,
    VoterStorage,
    IEntryPoint,
    Security,
    AgaroTierSystem
{
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
        tiers[1] = Tier({
            discount: 5,
            minHoldAGR: 100000000000000000000,
            maxPollingPerDay: 1
        });
        tiers[2] = Tier({
            discount: 10,
            minHoldAGR: 500000000000000000000,
            maxPollingPerDay: 2
        });
        tiers[3] = Tier({
            discount: 15,
            minHoldAGR: 1000000000000000000000,
            maxPollingPerDay: 3
        });
        tiers[4] = Tier({
            discount: 20,
            minHoldAGR: 2500000000000000000000,
            maxPollingPerDay: 4
        });
        tiers[5] = Tier({
            discount: 25,
            minHoldAGR: 5000000000000000000000,
            maxPollingPerDay: 5
        });
        tiers[6] = Tier({
            discount: 30,
            minHoldAGR: 10000000000000000000000,
            maxPollingPerDay: 6
        });
        tiers[7] = Tier({
            discount: 40,
            minHoldAGR: 20000000000000000000000,
            maxPollingPerDay: 7
        });
        tiers[8] = Tier({
            discount: 60,
            minHoldAGR: 50000000000000000000000,
            maxPollingPerDay: 8
        });
        tiers[9] = Tier({
            discount: 80,
            minHoldAGR: 75000000000000000000000,
            maxPollingPerDay: 9
        });
        tiers[10] = Tier({
            discount: 100,
            minHoldAGR: 100000000000000000000000,
            maxPollingPerDay: type(uint256).max
        });

        platformFee = 5000000000000000000;
        minHold = 100000000000000000000;
        baseIncentives = BaseIncentives({
            tier1: 50000000000000000000,
            tier5: 88000000000000000000,
            tier10: 200000000000000000000
        });

        merkleTreeAllowListImplementation = _merkleTreeAllowListImplementation;
        syntheticRewardImplementation = _syntheticRewardImplementation;
        token = IAGARO(_token);
        admin.push(AdminData({admin: msg.sender, isAdminAgreed: false}));
    }

    function _payFee(address sender) private returns (bool) {
        if (token.balanceOf(sender) > platformFee) return false;
        token.transferFrom(sender, address(this), platformFee);

        return true;
    }

    function withdrawFee() public onlyAdmin {
        uint256 tokenToBurn = (token.balanceOf(address(this)) * 20) / 100;
        token.burn(tokenToBurn);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    function newVotingPoll(
        VotingPollDataArgument calldata _pollData
    ) external systemActive {
        require(_payFee(msg.sender), "Insufficient Fee");
        require(
            canCreatePoll(msg.sender, token.balanceOf(msg.sender)),
            "Exceeded max create poll"
        );

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
        _recordPollCreation(msg.sender);
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
        address sender
    ) private returns (address) {
        address rewardContract = address(0);
        uint256 senderBalances = token.balanceOf(sender);
        if (senderBalances < rewardShare) {
            revert insufficientBalance(sender);
        }

        uint256 incentives;
        if (senderBalances > minHold) {
            incentives = _calculateMintIncentives(
                senderBalances,
                expiry.endDate - expiry.startDate
            );
        }

        uint256 total = rewardShare + incentives;
        if (total > 0) {
            rewardContract = _createSyntheticReward(total, expiry);
            if (rewardShare > 0) {
                token.transferFrom(sender, rewardContract, rewardShare);
            }
            if (incentives > 0) {
                token.mint(rewardContract, incentives);
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

    function setPlatformFee(uint256 _fee) public onlyAdmin {
        platformFee = _fee;
    }

    function setBaseIncentives(
        BaseIncentives memory _baseIncentives
    ) public onlyAdmin {
        baseIncentives = _baseIncentives;
    }

    function setMinHold(uint256 _minHold) public onlyAdmin {
        minHold = _minHold;
    }

    function updateTier(
        uint8 _tier,
        uint8 _discount,
        uint256 _minHoldAGR,
        uint256 _maxPollingPerDay
    ) public onlyAdmin {
        require(_tier >= 1 && _tier <= 10, "Tier must be 1-10");
        tiers[_tier] = Tier({
            discount: _discount,
            minHoldAGR: _minHoldAGR,
            maxPollingPerDay: _maxPollingPerDay
        });
    }
}
