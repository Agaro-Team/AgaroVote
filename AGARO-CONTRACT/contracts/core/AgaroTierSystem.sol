// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../structs.sol";
import "../interfaces/IAgaroTierSystem.sol";

/// @title Agaro Tier System
/// @notice Provides tier-based logic, incentives, and poll creation limits based on token holdings.
/// @dev Defines and manages user tiers, base incentives, and poll creation permissions for the AGARO ecosystem.
contract AgaroTierSystem is IAgaroTierSystem {
    /// @notice Mapping of tier levels to their respective tier configurations.
    mapping(uint256 => Tier) public tiers;

    /// @notice Records each user’s polling activity and reset time.
    mapping(address => UserPollData) public lastCreatedPoll;

    /// @notice Defines base incentive reward amounts for different tier groups.
    BaseIncentives public baseIncentives;

    /// @notice Minimum AGARO token holdings required for incentives and higher tiers.
    uint256 public minHold;

    /// @notice The fixed platform fee charged for poll creation.
    uint256 public platformFee;

    // -------------------------------------------------------------
    //                         VIEW FUNCTIONS
    // -------------------------------------------------------------

    /// @notice Determines the appropriate tier for a given token holding amount.
    /// @dev Compares the provided holding amount against tier thresholds.
    /// @param _minHoldAGR The amount of AGARO tokens held by the user.
    /// @return The corresponding tier level (1–10).
    function _normalizeTier(uint256 _minHoldAGR) public view returns (uint8) {
        if (_minHoldAGR >= tiers[10].minHoldAGR) return 10;
        if (_minHoldAGR >= tiers[9].minHoldAGR) return 9;
        if (_minHoldAGR >= tiers[8].minHoldAGR) return 8;
        if (_minHoldAGR >= tiers[7].minHoldAGR) return 7;
        if (_minHoldAGR >= tiers[6].minHoldAGR) return 6;
        if (_minHoldAGR >= tiers[5].minHoldAGR) return 5;
        if (_minHoldAGR >= tiers[4].minHoldAGR) return 4;
        if (_minHoldAGR >= tiers[3].minHoldAGR) return 3;
        if (_minHoldAGR >= tiers[2].minHoldAGR) return 2;
        return 1;
    }

    // -------------------------------------------------------------
    //                     INTERNAL CONFIG SETTERS
    // -------------------------------------------------------------

    /// @notice Updates the internal platform fee value.
    /// @dev Intended for internal use by administrative contracts.
    /// @param _fee The new platform fee amount.
    function _setPlatformFee(uint256 _fee) internal {
        platformFee = _fee;
    }

    /// @notice Updates the base incentive structure for reward calculations.
    /// @dev Defines the base incentive amounts for tier 1, tier 5, and tier 10.
    /// @param _baseIncentives The new base incentive structure.
    function _setBaseIncentives(
        BaseIncentives memory _baseIncentives
    ) internal {
        baseIncentives = _baseIncentives;
    }

    /// @notice Sets the minimum AGARO holdings required to qualify for rewards.
    /// @param _minHold The new minimum holding threshold.
    function _setMinHold(uint256 _minHold) internal {
        minHold = _minHold;
    }

    // -------------------------------------------------------------
    //                     POLL CREATION LOGIC
    // -------------------------------------------------------------

    /// @notice Records the creation of a new poll by a user.
    /// @dev Increments the count of polls created by the sender.
    /// @param sender The address of the user creating a poll.
    function _recordPollCreation(address sender) internal {
        UserPollData storage data = lastCreatedPoll[sender];
        data.pollsCreated += 1;
    }

    /// @notice Resets the poll creation count if 24 hours have elapsed.
    /// @dev Ensures users can only create a limited number of polls per day.
    /// @param sender The address of the user whose data is being checked.
    function _checkTimeValidity(address sender) internal {
        UserPollData storage data = lastCreatedPoll[sender];
        uint256 nowTime = block.timestamp;

        if (nowTime >= data.lastResetTime + 86400) {
            data.lastResetTime = nowTime;
            data.pollsCreated = 0;
        }
    }

    /// @notice Checks if a user is eligible to create a new poll based on their tier.
    /// @dev Uses the user’s holding amount to determine poll creation limits.
    /// @param sender The address of the poll creator.
    /// @param holdAmount The AGARO token balance held by the user.
    /// @return True if the user can create a new poll, false otherwise.
    function canCreatePoll(
        address sender,
        uint256 holdAmount
    ) internal returns (bool) {
        _checkTimeValidity(sender);

        UserPollData storage data = lastCreatedPoll[sender];
        uint8 tierLevel = _normalizeTier(holdAmount);
        Tier memory userTier = tiers[tierLevel];
        return data.pollsCreated < userTier.maxPollingPerDay;
    }

    // -------------------------------------------------------------
    //                     INCENTIVE CALCULATIONS
    // -------------------------------------------------------------

    /// @notice Converts a timestamp duration to the equivalent number of months.
    /// @dev Assumes 30 days per month (2592000 seconds).
    /// @param timestamp Duration in seconds.
    /// @return The equivalent duration in months.
    function _timestampToMonths(
        uint256 timestamp
    ) private pure returns (uint256) {
        return timestamp / 2592000;
    }

    /// @notice Calculates incentive rewards based on holdings, tier, and duration.
    /// @dev Incentives scale with tier level and poll duration (in months).
    /// @param holdAmount The amount of AGARO tokens held.
    /// @param durationTimestamps The poll duration in seconds.
    /// @return The total incentive reward amount.
    function _calculateMintIncentives(
        uint256 holdAmount,
        uint256 durationTimestamps
    ) internal view returns (uint256) {
        uint8 tier = _normalizeTier(holdAmount);
        uint256 months = _timestampToMonths(durationTimestamps);

        if (tier == 1) {
            if (months >= 9) return baseIncentives.tier1 + 100 ether;
            if (months >= 6) return baseIncentives.tier1 + 50 ether;
            if (months >= 3) return baseIncentives.tier1;
        } else if (tier == 5) {
            if (months >= 9) return baseIncentives.tier5 + 175 ether;
            if (months >= 6) return baseIncentives.tier5 + 87 ether;
            if (months >= 3) return baseIncentives.tier5;
        } else if (tier == 10) {
            if (months >= 9) return baseIncentives.tier10 + 400 ether;
            if (months >= 6) return baseIncentives.tier10 + 200 ether;
            if (months >= 3) return baseIncentives.tier10;
        }

        if (tier < 5) {
            uint256 base = baseIncentives.tier1 + ((tier - 1) * 9);
            if (months >= 9) base = (base * 3) / 2;
            if (months >= 6) base *= 2;
            if (months < 3) return 0;
            return base;
        } else if (tier < 10) {
            uint256 base = baseIncentives.tier5 + ((tier - 5) * 22);
            if (months >= 9) base = (base * 3) / 2;
            if (months >= 6) base *= 2;
            if (months < 3) return 0;
            return base;
        }
        return 0;
    }
}
