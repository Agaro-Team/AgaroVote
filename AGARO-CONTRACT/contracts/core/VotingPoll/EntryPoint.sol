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

/**
 * @title EntryPoint Contract
 * @author Agaro Protocol Team
 * @notice Main entry point for the AgaroVote decentralized voting platform with blockchain-verified data integrity
 * @dev Implements voting poll creation, voting mechanism, reward distribution, and tier-based fee system.
 * Integrates with MerkleTree for whitelisting, SyntheticReward for token distribution, and AGR token for platform fees.
 * Uses Clones pattern for gas-efficient deployment of auxiliary contracts.
 * @custom:version 1.0.0
 * @custom:security-contact security@agaro.io
 * @custom:standard ERC-20 (AGR Token), Clones Pattern, Merkle Tree Verification
 */
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

    /**
     * @notice Initializes the EntryPoint contract with tier configuration and implementation addresses
     * @dev Sets up 10 tiers with varying discounts and AGR holding requirements, initializes platform fee,
     * minimum hold requirements, base incentives, and deploys implementation contracts for cloning
     * @param _merkleTreeAllowListImplementation Address of the MerkleTreeAllowList implementation for cloning
     * @param _syntheticRewardImplementation Address of the SyntheticReward implementation for cloning
     * @param _token Address of the AGR ERC-20 token contract
     * @custom:tier-structure Tier 1 (5% discount, 100 AGR) to Tier 10 (100% discount, 100,000 AGR)
     * @custom:platform-fee Default platform fee is 5 AGR tokens
     */
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

    /**
     * @notice Internal function to process platform fee payment from poll creator
     * @dev Transfers platform fee in AGR tokens from sender to contract
     * @param sender Address of the user creating the poll
     * @return bool True if payment successful, false if insufficient balance
     * @custom:security Checks balance before transfer to prevent revert
     */
    function _payFee(address sender) private returns (bool) {
        if (token.balanceOf(sender) < platformFee) return false;
        token.transferFrom(sender, address(this), platformFee);

        return true;
    }

    /**
     * @notice Withdraws accumulated platform fees with automatic burn mechanism
     * @dev Burns 20% of collected fees and transfers remaining 80% to admin caller
     * @custom:access-control Only callable by admin addresses
     * @custom:tokenomics Implements deflationary mechanism by burning 20% of fees
     * @custom:event Emits AGR token Transfer events for burn and withdrawal
     */
    function withdrawFee() public onlyAdmin {
        uint256 tokenToBurn = (token.balanceOf(address(this)) * 20) / 100;
        token.burn(tokenToBurn);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    /**
     * @notice Creates a new voting poll with optional token requirements and whitelist
     * @dev Deploys clone contracts for MerkleTree and SyntheticReward if needed,
     * validates fee payment, tier limits, and versioning before poll creation
     * @param _pollData Struct containing poll configuration (candidates, expiry, privacy, rewards, etc.)
     * @custom:requirements
     * - Caller must have sufficient AGR tokens for platform fee
     * - Caller must not exceed daily poll creation limit based on tier
     * - If token-required poll, rewardShare must be > 0
     * - Poll versioning must match current contract version
     * @custom:gas-optimization Uses Clones pattern for auxiliary contract deployment
     * @custom:event Emits VotingPollCreated with poll hash, storage location, and reward contract address
     */
    function newVotingPoll(
        VotingPollDataArgument calldata _pollData
    ) external systemActive {
        require(_payFee(msg.sender), "Insufficient Fee");
        require(
            canCreatePoll(msg.sender, token.balanceOf(msg.sender)),
            "Exceeded max create poll"
        );
        if (_pollData.isTokenRequired) {
            require(
                _pollData.rewardShare != 0,
                "Need reward share for every token commit"
            );
        }
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

    /**
     * @notice Casts a vote in a specific poll for a selected candidate
     * @dev Validates voter credentials, merkle proof (if private poll), timing, token commitment,
     * and updates vote counts atomically
     * @param _voteData Struct containing pollHash, candidateSelected, commitToken, and merkle proofs
     * @custom:requirements
     * - Poll must exist and be active (within start/end date)
     * - Voter must be whitelisted (if private poll with merkle root)
     * - If poll requires tokens, commitToken must be > 0
     * - Voter must not have already voted in this poll
     * @custom:security Uses merkle proof verification for private polls
     * @custom:event Emits VoteSucceeded with poll hash, candidate index, token amount, and voter hash
     */
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

    /**
     * @notice Commits AGR tokens to the security pool for system stability
     * @dev Transfers tokens from caller to contract and records security commitment
     * @param amountToCommit Amount of AGR tokens to commit to security pool
     * @custom:security Protected by nonReentrant modifier to prevent reentrancy attacks
     * @custom:access-control Public function, any address can commit security tokens
     */
    function commitSecurity(uint256 amountToCommit) public nonReentrant {
        token.transferFrom(msg.sender, address(this), amountToCommit);
        _commitSecurity(amountToCommit);
    }

    /**
     * @notice Withdraws rewards and principal tokens from a completed poll
     * @dev Verifies caller has voted in the poll, then claims rewards from SyntheticReward contract
     * @param _pollHash Unique identifier of the poll to withdraw from
     * @custom:requirements
     * - Caller must have voted in the specified poll
     * - Poll must have an associated SyntheticReward contract
     * - System must be active
     * @custom:event Emits WithdrawSucceeded with poll hash, principal amount, rewards, and recipient
     */
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

    /**
     * @notice Withdraws committed security tokens from the security pool
     * @dev Calculates withdrawable amount and transfers AGR tokens back to caller
     * @custom:security Protected by nonReentrant modifier to prevent reentrancy attacks
     * @custom:access-control Public function, only caller's own security commitment is withdrawable
     */
    function withdrawSecurity() public nonReentrant {
        uint256 amountToTransfer = _withdrawSecurity(msg.sender);
        token.transfer(msg.sender, amountToTransfer);
    }

    /**
     * @notice Internal function to verify vote data integrity and poll existence
     * @dev Validates poll hash exists, candidate index is valid, and voter storage is bound
     * @param _voteData Vote argument containing poll hash and candidate selection
     * @return bytes32 Storage location hash for the voter in this poll
     * @custom:reverts
     * - PollHashDoesNotExist if poll hash not found
     * - CandidateDoesNotExist if candidate index exceeds candidates array
     * - PollDoesNotHaveVoterStorage if storage binding missing
     */
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

    /**
     * @notice Internal function to verify voter's credentials and eligibility to vote
     * @dev Checks merkle proof (if private), timing window, and token commitment requirements
     * @param _pollData Poll configuration data including merkle root and expiry
     * @param _voteData Vote argument with proofs and commit token amount
     * @param sender Address of the voter attempting to cast vote
     * @custom:reverts
     * - AddressIsNotAllowed if merkle proof verification fails (private polls)
     * - VotingIsNotActive if current time outside poll's start/end window
     * - PollNeedsCommitToken if token-required poll but commitToken is 0
     * @custom:side-effects Calls SyntheticReward.commit() if tokens committed
     */
    function _verifyVoterCredential(
        PollData memory _pollData,
        VoteArgument memory _voteData,
        address sender
    ) private {
        address cont = _pollData.merkleRootContract;
        if (cont != address(0))
            _verifyAddressWithProof(
                cont,
                _voteData.proofs,
                _voteData.pollHash,
                sender
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
                sender
            );
        }
    }

    /**
     * @notice Internal function to deploy a new MerkleTreeAllowList clone contract
     * @dev Uses OpenZeppelin Clones library for gas-efficient minimal proxy deployment
     * @param root Merkle root hash for whitelist verification
     * @return newClone Address of the newly deployed MerkleTreeAllowList clone
     * @custom:pattern Clones Pattern (EIP-1167) for minimal proxy deployment
     * @custom:gas-optimization Significantly cheaper than deploying full contract
     */
    function _createMerkleAllowlist(
        bytes32 root
    ) private returns (address newClone) {
        newClone = merkleTreeAllowListImplementation.clone();
        MerkleTreeAllowlist(newClone).initialize(address(this), root);
    }

    /**
     * @notice Internal function to initialize merkle root contract if needed
     * @dev Creates MerkleTreeAllowList clone only if merkle root hash is provided
     * @param merkleRootHash Root hash for whitelist, or bytes32(0) for public polls
     * @return address Address of deployed MerkleTreeAllowList, or address(0) if public poll
     * @custom:optimization Avoids deployment cost for public polls
     */
    function _initMerkleRootContract(
        bytes32 merkleRootHash
    ) private returns (address) {
        address merkleRootContract = address(0);

        if (merkleRootHash != bytes32(0))
            merkleRootContract = _createMerkleAllowlist(merkleRootHash);

        return merkleRootContract;
    }

    /**
     * @notice Internal function to deploy a new SyntheticReward clone contract
     * @dev Uses Clones pattern to deploy minimal proxy, initializes with poll parameters
     * @param rewardShare Total reward tokens to distribute (creator contribution + incentives)
     * @param expiry Poll expiry configuration with start/end timestamps
     * @return newClone Address of the newly deployed SyntheticReward clone
     * @custom:pattern Clones Pattern (EIP-1167) for gas-efficient deployment
     * @custom:calculation Duration = endDate - startDate for reward vesting calculation
     */
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

    /**
     * @notice Internal function to initialize and fund SyntheticReward contract for poll
     * @dev Calculates incentives based on creator's AGR holdings, deploys reward contract,
     * and transfers tokens (creator's rewardShare + protocol-minted incentives)
     * @param rewardShare Amount of AGR tokens creator commits to reward pool
     * @param expiry Poll timing configuration for duration calculation
     * @param sender Address of poll creator (token source)
     * @return address Address of deployed SyntheticReward contract, or address(0) if no rewards
     * @custom:reverts insufficientBalance if sender balance < rewardShare
     * @custom:incentives Minted by protocol based on holder tier (tier 1/5/10 thresholds)
     * @custom:tokenomics Combines creator contribution + protocol incentives for total reward pool
     */
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

    /**
     * @notice Internal function to verify voter address against merkle proof
     * @dev Calls MerkleTreeAllowList contract to validate proof inclusion
     * @param cont Address of the MerkleTreeAllowList contract to verify against
     * @param proofs Array of merkle proof hashes for verification
     * @param pollHash Poll identifier for error reporting
     * @param voter Address to verify in whitelist
     * @return bool True if address is allowed (proof valid)
     * @custom:reverts AddressIsNotAllowed if merkle proof verification fails
     * @custom:security Critical security check for private polls
     */
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

    /**
     * @notice Updates the platform fee for poll creation
     * @dev Sets new fee amount in AGR tokens (wei denomination)
     * @param _fee New platform fee amount in AGR token wei
     * @custom:access-control Only callable by admin addresses
     * @custom:governance Fee changes affect all future poll creations
     */
    function setPlatformFee(uint256 _fee) public onlyAdmin {
        platformFee = _fee;
    }

    /**
     * @notice Updates base incentive amounts for different tier levels
     * @dev Sets reward multipliers for tier 1, tier 5, and tier 10 holders
     * @param _baseIncentives Struct containing tier1, tier5, tier10 incentive amounts in AGR wei
     * @custom:access-control Only callable by admin addresses
     * @custom:governance Affects protocol-minted rewards for future polls
     * @custom:tokenomics Higher tiers receive proportionally larger incentive multipliers
     */
    function setBaseIncentives(
        BaseIncentives memory _baseIncentives
    ) public onlyAdmin {
        baseIncentives = _baseIncentives;
    }

    /**
     * @notice Updates minimum AGR token holding requirement for incentive eligibility
     * @dev Sets threshold balance required to receive protocol-minted incentives
     * @param _minHold Minimum AGR token balance (in wei) required for incentives
     * @custom:access-control Only callable by admin addresses
     * @custom:governance Affects incentive eligibility for all future polls
     * @custom:threshold Default is 100 AGR tokens (100 * 10^18 wei)
     */
    function setMinHold(uint256 _minHold) public onlyAdmin {
        minHold = _minHold;
    }

    /**
     * @notice Updates tier configuration with new parameters
     * @dev Modifies discount rate, minimum AGR holding requirement, and daily poll limit for a tier
     * @param _tier Tier number (1-10) to update
     * @param _discount Discount percentage on platform fee (0-100, where 100 = free)
     * @param _minHoldAGR Minimum AGR token balance required to qualify for this tier (in wei)
     * @param _maxPollingPerDay Maximum polls user can create per day at this tier
     * @custom:access-control Only callable by admin addresses
     * @custom:validation Requires tier number between 1 and 10 (inclusive)
     * @custom:governance Changes affect all users qualifying for the tier immediately
     * @custom:example Tier 10: 100% discount, 100,000 AGR minimum, unlimited daily polls
     */
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
