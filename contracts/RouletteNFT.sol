// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RouletteNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string private baseURI;
    address private baseURISetter;

    constructor(string memory name, string memory symbol, string memory initialBaseURI, address initialOwner, address initialBaseURISetter) ERC721(name, symbol) {
        baseURI = initialBaseURI;
        transferOwnership(initialOwner);
        baseURISetter = initialBaseURISetter;
    }

    modifier onlyBaseURISetter() {
        require(msg.sender == baseURISetter, "Caller is not the baseURI setter");
        _;
    }

    function setBaseURI(string memory newBaseURI) external onlyBaseURISetter {
        baseURI = newBaseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function mint(address to) external onlyOwner {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(to, newTokenId);
    }
}
