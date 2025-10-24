// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ISecurity.sol";
import "../structs.sol";

/// @title Security Contract
/// @notice Handles administrative consensus, system halting, and token commitment security mechanisms.
/// @dev Includes admin governance, security commit threshold checks, and emergency halt functionality.
contract Security is ISecurity, ReentrancyGuard {
    /// @notice Total tokens committed by all users.
    uint256 totalCommitedToken;

    /// @notice System state flag. When true, the system is halted.
    bool private halted;

    /// @notice Array of admin data containing admin address and agreement status.
    AdminData[] public admin;

    /// @notice Minimum amount of committed tokens required for critical operations.
    uint256 public commitThreshold;

    /// @notice Mapping to track how much each address has committed.
    mapping(address => uint256) public committedAmount;

    // -------------------------------------------------------------
    //                        MODIFIERS
    // -------------------------------------------------------------

    /// @notice Restricts access to only admin addresses.
    /// @dev Iterates through admin list to verify caller’s role.
    modifier onlyAdmin() {
        bool isAdmin;
        for (uint8 i = 0; i < admin.length; i++) {
            if (admin[i].admin == msg.sender) {
                isAdmin = true;
            }
        }
        require(isAdmin, "Not admin");
        _;
    }

    /// @notice Ensures that all admins have agreed to a critical action.
    /// @dev Each admin’s `isAdminAgreed` flag must be true.
    modifier allAdminAgreed() {
        for (uint8 i = 0; i < admin.length; i++) {
            require(admin[i].isAdminAgreed, "Not all admin agreed");
        }
        _;
    }

    /// @notice Restricts function execution when the system is halted.
    /// @dev Reverts if the system is currently halted.
    modifier systemActive() {
        require(!halted, "System is halted");
        _;
    }

    /// @notice Ensures that the total committed tokens exceed the commit threshold.
    /// @dev Protects critical operations from running below safety thresholds.
    modifier criticalActionAllowed() {
        require(
            totalCommitedToken > commitThreshold,
            "Commited Token is bellow treshold"
        );
        _;
    }

    // -------------------------------------------------------------
    //                        ADMIN ACTIONS
    // -------------------------------------------------------------

    /// @notice Sets the threshold of committed tokens required for critical actions.
    /// @param threshold The minimum total committed tokens required.
    function setCommitTreshold(uint256 threshold) public onlyAdmin {
        commitThreshold = threshold;
    }

    /// @notice Marks an admin as having agreed to a consensus operation.
    /// @dev Updates `isAdminAgreed` flag for the calling admin.
    function agree() public onlyAdmin {
        for (uint8 i = 0; i < admin.length; i++) {
            if (admin[i].admin == msg.sender) {
                admin[i].isAdminAgreed = true;
                break;
            }
        }
    }

    /// @notice Resets the consensus agreement state for all admins.
    /// @dev Sets every admin’s `isAdminAgreed` flag to false.
    function resetConsensus() public onlyAdmin {
        for (uint8 i = 0; i < admin.length; i++) {
            admin[i].isAdminAgreed = false;
        }
    }

    /// @notice Adds or removes admins from the system.
    /// @dev Admins can add or remove other admins using options `"add"` or `"remove"`.
    /// @param option The operation type: `"add"` or `"remove"`.
    /// @param _admin The admin address to add or remove.
    function adminOps(string memory option, address _admin) public onlyAdmin {
        bytes32 opt = keccak256(abi.encodePacked(option));

        if (opt == keccak256("add")) {
            require(admin.length < 5, "Max admin 5.");
            for (uint i = 0; i < admin.length; i++) {
                require(admin[i].admin != _admin, "Admin already exists");
            }
            admin.push(AdminData({admin: _admin, isAdminAgreed: false}));
        } else if (opt == keccak256("remove")) {
            require(_admin != msg.sender, "Cannot remove self");
            AdminData[] memory newAdmin = new AdminData[](admin.length - 1);
            uint8 found;

            unchecked {
                for (uint8 i = 0; i < admin.length; i++) {
                    uint8 index = i - found;
                    if (admin[i].admin == _admin) {
                        found++;
                        continue;
                    }
                    newAdmin[index] = admin[i];
                }

                delete admin;
                for (uint i = 0; i < newAdmin.length; i++) {
                    admin.push(newAdmin[i]);
                }
            }
        } else {
            revert("Invalid admin operation");
        }
    }

    // -------------------------------------------------------------
    //                        SECURITY LOGIC
    // -------------------------------------------------------------

    /// @notice Commits tokens to the security pool.
    /// @dev Used to ensure staked value before sensitive operations.
    /// @param amount The amount of tokens to commit.
    function _commitSecurity(uint256 amount) internal {
        require(amount > 0, "Invalid amount");
        committedAmount[msg.sender] += amount;
        totalCommitedToken += amount;
        emit TokenCommitted(msg.sender, amount);
    }

    /// @notice Withdraws all committed tokens for a given user.
    /// @dev Internal function that resets committed token count for the sender.
    /// @param sender The address whose tokens are withdrawn.
    /// @return The total amount of committed tokens withdrawn.
    function _withdrawSecurity(address sender) internal returns (uint256) {
        uint256 totalCommitedTokenOfUser = committedAmount[sender];
        require(totalCommitedTokenOfUser > 0, "Invalid amount");
        committedAmount[sender] = 0;
        return totalCommitedTokenOfUser;
    }

    // -------------------------------------------------------------
    //                        SYSTEM CONTROL
    // -------------------------------------------------------------

    /// @notice Halts all system operations.
    /// @dev Requires full admin consensus and token threshold condition.
    function haltAll() public allAdminAgreed criticalActionAllowed {
        halted = true;
        emit SystemHalted(msg.sender);
    }

    /// @notice Resumes all system operations.
    /// @dev Only callable by an admin.
    function resumeAll() external onlyAdmin {
        halted = false;
        emit SystemResumed(msg.sender);
    }

    /// @notice Returns the current halted status of the system.
    /// @dev True if the system is halted, false otherwise.
    /// @return Whether the system is halted.
    function isHalted() external view returns (bool) {
        return halted;
    }
}
