// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../../interfaces/ERC20-AGR/IAGR.sol";
import "../../interfaces/SyntheticReward/ISyntheticReward.sol";

/// @title SyntheticReward
/// @notice Manages synthetic reward distribution for staking or poll participation.
/// @dev Uses reward rate logic similar to staking contracts.
///      Handles initialization, committing tokens, and reward claiming.
contract SyntheticReward is
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    ISyntheticReward
{
    /// @notice Token used for reward distribution (AGARO token).
    IAGARO public token;

    /// @notice Duration of the reward distribution period in seconds.
    uint256 public duration;

    /// @notice Timestamp when the current reward period ends.
    uint256 public finishAt;

    /// @notice Timestamp when rewards were last updated.
    uint256 public updatedAt;

    /// @notice The rate at which rewards are distributed per second.
    uint256 public rewardRate;

    /// @notice The accumulated reward per token (scaled by 1e18).
    uint256 public rewardPerTokenStored;

    /// @notice Mapping of user addresses to the reward per token value they have been paid.
    mapping(address => uint256) public userRewardPerTokenPaid;

    /// @notice Mapping of user addresses to the rewards they have accrued but not yet claimed.
    mapping(address => uint256) public rewards;

    /// @notice The total amount of tokens committed (staked) by all users.
    uint256 public totalSupply;

    /// @notice Mapping of each user’s committed (staked) balance.
    mapping(address => uint256) public balanceOf;

    // -------------------------------------------------------------
    //                         MODIFIERS
    // -------------------------------------------------------------

    /// @notice Updates reward variables for an account before any state-changing actions.
    /// @dev Used to maintain consistent reward accounting across multiple actions.
    /// @param _account Address of the account whose rewards should be updated.
    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();
        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }

    // -------------------------------------------------------------
    //                         INITIALIZER
    // -------------------------------------------------------------

    /// @notice Initializes the SyntheticReward contract.
    /// @dev Must only be called once (initializer pattern).
    /// @param _owner The contract owner.
    /// @param _token Address of the AGARO token used for rewards.
    /// @param _duration The duration (in seconds) of the reward period.
    /// @param _rewardShare The total reward tokens allocated for the duration.
    function initialize(
        address _owner,
        address _token,
        uint256 _duration,
        uint256 _rewardShare
    ) external initializer {
        if (_rewardShare == 0 || _duration == 0) revert InvalidInitialization();

        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        _transferOwnership(_owner);

        token = IAGARO(_token);
        _setRewardsDuration(_duration);
        _notifyRewardAmount(_rewardShare);
    }

    // -------------------------------------------------------------
    //                         VIEW FUNCTIONS
    // -------------------------------------------------------------

    /// @notice Returns the latest timestamp at which rewards are applicable.
    /// @dev If rewards have ended, returns `finishAt`; otherwise returns current timestamp.
    /// @return Timestamp representing the last applicable time for rewards.
    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(block.timestamp, finishAt);
    }

    /// @notice Calculates the reward per token currently accumulated.
    /// @dev Uses the difference between last update time and last reward applicable time.
    /// @return The updated reward per token value (scaled by 1e18).
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        } else {
            uint256 _duration = lastTimeRewardApplicable() - updatedAt;
            return
                rewardPerTokenStored +
                (rewardRate * _duration * 1e18) /
                totalSupply;
        }
    }

    /// @notice Calculates the total rewards earned by an account so far.
    /// @param _account The address of the user.
    /// @return The total reward tokens earned.
    function earned(address _account) public view returns (uint256) {
        return
            ((balanceOf[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    // -------------------------------------------------------------
    //                         USER ACTIONS
    // -------------------------------------------------------------

    /// @notice Allows the owner to commit (stake) tokens on behalf of a user.
    /// @dev Tokens are transferred from the sender to this contract.
    /// @param _amount The number of tokens to commit.
    /// @param _sender The user whose tokens are being committed.
    function commit(
        uint256 _amount,
        address _sender
    ) external nonReentrant onlyOwner updateReward(_sender) {
        if (_amount == 0) revert AmountZero();

        token.transferFrom(_sender, address(this), _amount);
        balanceOf[_sender] += _amount;
        totalSupply += _amount;
    }

    /// @notice Allows the owner to withdraw staked tokens and earned rewards for a user.
    /// @dev Can only be called after the reward duration has ended.
    /// @param _sender The address of the user withdrawing.
    /// @return rewardsPaid The total reward claimed.
    /// @return principalReturned The amount of committed tokens returned.
    function withdraw(
        address _sender
    )
        external
        nonReentrant
        onlyOwner
        updateReward(_sender)
        returns (uint256 rewardsPaid, uint256 principalReturned)
    {
        if (balanceOf[_sender] == 0) revert AmountZero();
        if (block.timestamp <= finishAt) revert ContractNotFinished();

        uint256 _amount = balanceOf[_sender];
        balanceOf[_sender] = 0;
        totalSupply -= _amount;
        token.transfer(_sender, _amount);

        return (_getReward(_sender), _amount);
    }

    // -------------------------------------------------------------
    //                         INTERNAL HELPERS
    // -------------------------------------------------------------

    /// @notice Internal function to claim rewards for a specific user.
    /// @dev Resets stored rewards to zero after transfer.
    /// @param _sender The user claiming rewards.
    /// @return amount The amount of rewards paid.
    function _getReward(
        address _sender
    ) private updateReward(_sender) returns (uint256 amount) {
        amount = rewards[_sender];
        rewards[_sender] = 0;
        token.transfer(_sender, amount);
        return amount;
    }

    /// @notice Internal function to set reward distribution duration.
    /// @dev Reverts if the previous reward period has not elapsed.
    /// @param _duration The new reward duration (in seconds).
    function _setRewardsDuration(uint256 _duration) private {
        if (finishAt >= block.timestamp) revert DurationNotElapsed();
        duration = _duration;
    }

    /// @notice Internal function to notify contract of a new reward amount.
    /// @dev Adjusts reward rate based on remaining rewards and duration.
    /// @param _amount The new total reward amount to distribute.
    function _notifyRewardAmount(
        uint256 _amount
    ) private updateReward(address(0)) {
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remainingRewards = rewardRate *
                (finishAt - block.timestamp);
            rewardRate = (_amount + remainingRewards) / duration;
        }
        if (rewardRate == 0) revert InvalidRewardRate();

        updatedAt = block.timestamp;
        finishAt = block.timestamp + duration;
    }

    /// @notice Internal utility function to get the minimum of two values.
    /// @param x First value.
    /// @param y Second value.
    /// @return The smaller of `x` and `y`.
    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }
}
