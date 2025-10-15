// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ISyntheticReward {
    // --- Views ---

    function token() external view returns (address);

    function duration() external view returns (uint256);
    function finishAt() external view returns (uint256);
    function updatedAt() external view returns (uint256);
    function rewardRate() external view returns (uint256);
    function rewardPerTokenStored() external view returns (uint256);

    function userRewardPerTokenPaid(address account) external view returns (uint256);
    function rewards(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);

    function lastTimeRewardApplicable() external view returns (uint256);
    function rewardPerToken() external view returns (uint256);
    function earned(address account) external view returns (uint256);

    // --- Admin / Control Functions ---

    function initialize(
        address _owner,
        address _token,
        uint256 _duration,
        uint256 rewardShare
    ) external;

    // These are owner-only actions that commit or withdraw user tokens
    function commit(uint256 _amount, address _sender) external;
    function withdraw(uint256 _amount, address _sender) external;
}
