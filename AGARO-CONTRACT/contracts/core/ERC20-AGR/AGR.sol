// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AGARO is IERC20, ReentrancyGuard {
    string public name = "AGARO";
    string public symbol = "AGR";
    uint8 public decimals = 18;
    uint256 public override totalSupply;

    mapping(address => uint256) public override balanceOf;

    function mint(address _to, uint256 _amount) external nonReentrant {
        require(_to != address(0), "Cannot mint to zero address");
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    function transfer(
        address _to,
        uint256 _amount
    ) external override returns (bool) {
        _transfer(msg.sender, _to, _amount);
        return true;
    }

    function approve(address, uint256) external pure override returns (bool) {
        return true;
    }

    function allowance(
        address,
        address
    ) external pure override returns (uint256) {
        return type(uint256).max;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) external override returns (bool) {
        _transfer(_from, _to, _amount);
        return true;
    }

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
