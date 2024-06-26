// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("MyERC20Token", "MET") {
        _mint(0x2aB117cCa238C1E04aAB031C24E3aBacca953f3D, 10000000000000 * (10 ** uint256(decimals())));
    }

    /// @notice Mint new tokens and assign them to a specified address.
    /// @param to The address to which new tokens will be minted.
    /// @param amount The amount of tokens to mint.
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
