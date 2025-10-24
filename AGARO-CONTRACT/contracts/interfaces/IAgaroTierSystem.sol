// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../structs.sol";

interface IAgaroTierSystem {
    /// @notice Normalize a user's AGR holding amount to its tier level (1–10)
    /// @param _minHoldAGR The user's AGR token holding
    /// @return The normalized tier (1–10)
    function _normalizeTier(uint256 _minHoldAGR) external view returns (uint8);

    // /// @notice Check if a user can create a new poll based on their tier and recent poll history
    // /// @param sender The user's wallet address
    // /// @param holdAmount The AGR token balance held by the user
    // /// @return Boolean indicating if the user can create another poll
    // function canCreatePoll(
    //     address sender,
    //     uint256 holdAmount
    // ) external view returns (bool);

    /// @notice Get minimum hold required to participate
    function minHold() external view returns (uint256);

    /// @notice Get the platform fee percentage
    function platformFee() external view returns (uint256);

    // // ----- Internal Logic Exposures -----
    // /// @notice Calculates mint incentives based on holding and duration
    // /// @param holdAmount AGR tokens held by the user
    // /// @param durationTimestamps Duration of the poll in seconds
    // /// @return Incentive amount (in AGR)
    // function _calculateMintIncentives(
    //     uint256 holdAmount,
    //     uint256 durationTimestamps
    // ) external view returns (uint256);
}
