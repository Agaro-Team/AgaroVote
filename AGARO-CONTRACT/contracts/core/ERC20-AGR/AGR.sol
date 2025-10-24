// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AGARO Token
/// @notice A simple ERC20-like token with minting and burning functionality.
/// @dev Implements IERC20 interface with unlimited allowance and non-reentrant protections.
contract AGARO is IERC20, ReentrancyGuard {
    /// @notice The name of the token.
    string public name = "AGARO";

    /// @notice The symbol of the token.
    string public symbol = "AGR";

    /// @notice Number of decimal places used for display purposes.
    uint8 public decimals = 18;

    /// @notice The total supply of the token.
    uint256 public override totalSupply;

    /// @notice Mapping of token balances by address.
    mapping(address => uint256) public override balanceOf;

    // -------------------------------------------------------------
    //                         FUNCTIONS
    // -------------------------------------------------------------

    /// @notice Mints new tokens to a specified address.
    /// @dev Emits a {Transfer} event with `from` set to the zero address.
    /// @param _to The address receiving the minted tokens.
    /// @param _amount The number of tokens to mint (in wei).
    function mint(address _to, uint256 _amount) external nonReentrant {
        require(_to != address(0), "Cannot mint to zero address");
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    /// @notice Transfers tokens from the caller to another address.
    /// @dev Calls the internal `_transfer` function to perform the move.
    /// @param _to The recipient of the tokens.
    /// @param _amount The number of tokens to transfer.
    /// @return success Returns true if the transfer succeeded.
    function transfer(
        address _to,
        uint256 _amount
    ) external override returns (bool) {
        _transfer(msg.sender, _to, _amount);
        return true;
    }

    /// @notice Approves a spender for token transfers.
    /// @dev Always returns true, effectively granting unlimited allowance.
    /// @param spender The address authorized to spend.
    /// @param amount The allowance amount (ignored).
    /// @return success Returns true for compatibility.
    function approve(address spender, uint256 amount) external pure override returns (bool) {
        return true;
    }

    /// @notice Returns the allowance between two addresses.
    /// @dev Always returns `type(uint256).max` (infinite allowance).
    /// @param owner The address of the token holder.
    /// @param spender The address of the spender.
    /// @return allowance Always returns `type(uint256).max`.
    function allowance(
        address owner,
        address spender
    ) external pure override returns (uint256) {
        return type(uint256).max;
    }

    /// @notice Transfers tokens from one address to another.
    /// @dev Does not check allowance (unlimited approval model).
    /// @param _from The address to send tokens from.
    /// @param _to The address to send tokens to.
    /// @param _amount The number of tokens to transfer.
    /// @return success Returns true if successful.
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) external override returns (bool) {
        _transfer(_from, _to, _amount);
        return true;
    }

    /// @notice Burns a specific number of tokens from the caller’s balance.
    /// @dev Reduces both total supply and sender’s balance.
    /// @param _amount The number of tokens to burn.
    function burn(uint256 _amount) external nonReentrant {
        require(
            balanceOf[msg.sender] >= _amount,
            "Insufficient balance to burn"
        );
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        emit Transfer(msg.sender, address(0), _amount);
    }

    /// @notice Internal function to perform a token transfer.
    /// @dev Validates addresses and balances before updating state.
    /// @param _from The address sending tokens.
    /// @param _to The address receiving tokens.
    /// @param _amount The number of tokens to move.
    function _transfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal nonReentrant {
        require(_from != address(0), "ERC20: transfer from zero address");
        require(_to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[_from] >= _amount, "ERC20: insufficient balance");

        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
    }
}
