// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ISecurity.sol";

contract Security is ISecurity, ReentrancyGuard {
    address public admin;
    bool private halted;
    uint256 public commitThreshold;
    uint256 totalCommitedToken;
    mapping(address => uint256) public committedAmount;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier systemActive() {
        require(!halted, "System is halted");
        _;
    }

    modifier criticalActionAllowed() {
        require(
            totalCommitedToken > commitThreshold,
            "Commited Token is bellow treshold"
        );
        _;
    }

    function setCommitTreshold(uint256 threshold) public onlyAdmin {
        commitThreshold = threshold;
    }

    function _commitSecurity(uint256 amount) internal {
        require(amount > 0, "Invalid amount");
        committedAmount[msg.sender] += amount;
        totalCommitedToken += amount;
        emit TokenCommitted(msg.sender, amount);
    }

    function _withdrawSecurity(address sender) internal returns (uint256) {
        uint256 totalCommitedTokenOfUser = committedAmount[sender];
        require(totalCommitedTokenOfUser > 0, "Invalid amount");
        committedAmount[sender] = 0;
        return totalCommitedTokenOfUser;
    }

    function haltAll() public onlyAdmin criticalActionAllowed {
        halted = true;
        emit SystemHalted(msg.sender);
    }

    function resumeAll() external onlyAdmin {
        halted = false;
        emit SystemResumed(msg.sender);
    }

    function isHalted() external view returns (bool) {
        return halted;
    }
}
