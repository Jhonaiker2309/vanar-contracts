// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./RouletteNFT.sol";

/// @title A Prizes smart contract
/// @notice This code has not been audited. Use at your own peril.
contract VanarRouletteHandler is Ownable {

    using Strings for uint256;

    // Mapping to keep track of completed transactions for users
    mapping(address => mapping(uint256 => bool)) private _transactionDone;

    // Event emitted when an ERC721 token is minted
    event MintingERC721(address indexed userAddress, address indexed nftAddress);

    constructor() {}

    /// @notice Mint ERC-721 token to a specified address.
    /// @param userAddress The address to which tokens are transferred.
    /// @param nftAddress The address of the ERC-721 token contract.
    /// @param transactionNumber The number of the transaction
    function mintERC721(
        address userAddress,
        address nftAddress,
        uint256 transactionNumber
    )
        public
        onlyOwner
        checkIfUserAlreadyDidTransaction(userAddress, transactionNumber)
    {
        _transactionDone[userAddress][transactionNumber] = true;

        require(IERC721(nftAddress).supportsInterface(type(IERC721).interfaceId), "Invalid ERC721 contract");

        RouletteNFT(nftAddress).mint(userAddress);

        emit MintingERC721(userAddress, nftAddress);
    }

    /// @notice Modifier that checks if the transaction number was already used
    /// @param userAddress The address of the user
    /// @param transactionNumber The number of the transaction
    modifier checkIfUserAlreadyDidTransaction(address userAddress, uint256 transactionNumber) {
        require(!_transactionDone[userAddress][transactionNumber], "The number of the transaction was already used");
        _;
    }       
}

