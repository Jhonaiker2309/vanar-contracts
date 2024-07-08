// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTTest3 is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("NFTTest3", "NF3") {
    }

    function mint(address to) external onlyOwner {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(to, newTokenId);
    } 
}
