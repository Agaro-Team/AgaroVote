// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../../interfaces/ERC20-AGR/IAGR.sol";
import "../../interfaces/SyntheticReward/ISyntheticReward.sol";

contract SyntheticReward is
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    ISyntheticReward
{
    IAGARO public token;

    uint256 public duration;
    uint256 public finishAt;
    uint256 public updatedAt;
    uint256 public rewardRate;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();
        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }

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

    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(block.timestamp, finishAt);
    }

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

    function commit(
        uint256 _amount,
        address _sender
    ) external nonReentrant onlyOwner updateReward(_sender) {
        if (_amount == 0) revert AmountZero();

        token.transferFrom(_sender, address(this), _amount);
        balanceOf[_sender] += _amount;
        totalSupply += _amount;
    }

    function withdraw(
        address _sender
    )
        external
        nonReentrant
        onlyOwner
        updateReward(_sender)
        returns (uint256, uint256)
    {
        if (balanceOf[_sender] == 0) revert AmountZero();
        if (block.timestamp <= finishAt) revert ContractNotFinished();

        uint256 _amount = balanceOf[_sender];
        balanceOf[_sender] = 0;

        totalSupply -= _amount;
        token.transfer(_sender, _amount);

        return (_getReward(_sender), _amount);
    }

    function earned(address _account) public view returns (uint256) {
        return
            ((balanceOf[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    function earnedListAccounts(
        address[] memory _accounts
    ) public view returns (uint256) {
        uint256 total = 0;

        for (uint256 i = 0; i < _accounts.length; i++) {
            address account = _accounts[i];
            total += earned(account);
        }

        return total;
    }

    function _getReward(
        address _sender
    ) private updateReward(_sender) returns (uint256) {
        uint256 amount = rewards[_sender];
        rewards[_sender] = 0;
        token.transfer(_sender, amount);
        return amount;
    }

    function _setRewardsDuration(uint256 _duration) private {
        if (finishAt >= block.timestamp) revert DurationNotElapsed();
        duration = _duration;
    }

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

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }
}
