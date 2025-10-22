// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ISecurity {
    event TokenCommitted(address indexed user, uint256 amount);
    event SystemHalted(address indexed admin);
    event SystemResumed(address indexed admin);

    function isHalted() external view returns (bool);
}
