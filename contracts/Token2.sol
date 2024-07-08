// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token2 is ERC20 {
    constructor() ERC20("Token2", "Tk2") {
    }

    /// @notice Mint new tokens and assign them to a specified address.
    /// @param to The address to which new tokens will be minted.
    /// @param amount The amount of tokens to mint.
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
