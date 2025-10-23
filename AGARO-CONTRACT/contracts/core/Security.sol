// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ISecurity.sol";
import "../structs.sol";

contract Security is ISecurity, ReentrancyGuard {
    uint256 totalCommitedToken;
    bool private halted;
    AdminData[] public admin;
    uint256 public commitThreshold;
    mapping(address => uint256) public committedAmount;

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

    modifier allAdminAgreed() {
        for (uint8 i = 0; i < admin.length; i++) {
            require(admin[i].isAdminAgreed, "Not all admin agreed");
        }
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

    function haltAll() public allAdminAgreed criticalActionAllowed {
        halted = true;
        emit SystemHalted(msg.sender);
    }

    function resumeAll() external onlyAdmin {
        halted = false;
        emit SystemResumed(msg.sender);
    }

    function agree() public onlyAdmin {
        for (uint8 i = 0; i < admin.length; i++) {
            if (admin[i].admin == msg.sender) {
                admin[i].isAdminAgreed = true;
                break;
            }
        }
    }

    function resetConsensus() public onlyAdmin {
        for (uint8 i = 0; i < admin.length; i++) {
            admin[i].isAdminAgreed = false;
        }
    }

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

    function isHalted() external view returns (bool) {
        return halted;
    }
}
