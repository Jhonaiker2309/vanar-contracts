// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/// @title A whitelisting via mapping example
/// @author Jhonatan Hernández
/// @notice This code has not been audited. Use at your own peril.
contract Imp1Mapping {
    mapping(address => bool) private whitelist;
    address public owner;
    uint256 public data;

    constructor()  {
        owner = msg.sender;
    }

    /// @notice Validates the presence of the sender in the whitelist mapping
    modifier onlyWhitelist {
        require(whitelist[msg.sender], "Not whitelisted");
        _;
    }

    /// @notice Allows the contract owner to whitelist an user
    /// @param newAddress The address of the user to whitelist
    function whitelistAddress(address newAddress) public {
        require(msg.sender == owner);
        whitelist[newAddress] = true;
    }

    /// @notice Allows a whitelisted user to modify the data variable
    /// @dev It uses the onlyWhitelist modifier for validation
    /// @param _data new value for the data variable
    function changeData (uint _data) external onlyWhitelist {
        data = _data;
    }
}
