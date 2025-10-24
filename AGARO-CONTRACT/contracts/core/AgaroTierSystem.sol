// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../structs.sol";
import "../interfaces/IAgaroTierSystem.sol";

contract AgaroTierSystem is IAgaroTierSystem {
    mapping(uint256 => Tier) public tiers;
    mapping(address => UserPollData) public lastCreatedPoll;
    BaseIncentives public baseIncentives;
    uint256 public minHold;
    uint256 public platformFee;

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

    function _setPlatformFee(uint256 _fee) internal {
        platformFee = _fee;
    }

    function _setBaseIncentives(
        BaseIncentives memory _baseIncentives
    ) internal {
        baseIncentives = _baseIncentives;
    }

    function _setMinHold(uint256 _minHold) internal {
        minHold = _minHold;
    }

    function _recordPollCreation(address sender) internal {
        UserPollData storage data = lastCreatedPoll[sender];
        data.pollsCreated += 1;
    }

    function _checkTimeValidity(address sender) internal {
        UserPollData storage data = lastCreatedPoll[sender];
        uint256 nowTime = block.timestamp;

        if (nowTime >= data.lastResetTime + 86400) {
            data.lastResetTime = nowTime;
            data.pollsCreated = 0;
        }
    }

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

    function _timestampToMonths(
        uint256 timestamp
    ) private pure returns (uint256) {
        return timestamp / 2592000;
    }

    function _calculateMintIncentives(
        uint256 holdAmount,
        uint256 durationTimestamps
    ) internal view returns (uint256) {
        uint8 tier = _normalizeTier(holdAmount);
        uint256 months = _timestampToMonths(durationTimestamps);

        if (tier == 1) {
            if (months >= 9)
                return baseIncentives.tier1 + 100000000000000000000;
            if (months >= 6) return baseIncentives.tier1 + 50000000000000000000;
            if (months >= 3) return baseIncentives.tier1;
        } else if (tier == 5) {
            if (months >= 9)
                return baseIncentives.tier5 + 175000000000000000000;
            if (months >= 6) return baseIncentives.tier5 + 87000000000000000000;
            if (months >= 3) return baseIncentives.tier5;
        } else if (tier == 10) {
            if (months >= 9)
                return baseIncentives.tier10 + 400000000000000000000;
            if (months >= 6)
                return baseIncentives.tier10 + 200000000000000000000;
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
