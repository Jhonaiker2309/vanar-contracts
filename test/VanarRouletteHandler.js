// SPDX-License-Identifier: UNLICENSED
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('VanarRouletteHandler', function () {
  let owner, user1, nftAddress1,nftAddress2,nftAddress3, nft1,nft2,nft3;
  let handler;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy the contract
    const VanarRouletteHandler = await ethers.getContractFactory('VanarRouletteHandler');
    handler = await VanarRouletteHandler.deploy();
    await handler.deployed();;  

    // Deploy ERC721 tokens for testing
    const NFTTest1 = await ethers.getContractFactory('RouletteNFT');
    nft1 = await NFTTest1.deploy("Roulette", "RT", "SDAS", handler.address, owner.address);
    nftAddress1 = nft1.address;

    const NFTTest2 = await ethers.getContractFactory('RouletteNFT');
    nft2 = await NFTTest2.deploy("Roulette", "RT", "SDAS", handler.address, owner.address);
    nftAddress2 = nft2.address;
    
    const NFTTest3 = await ethers.getContractFactory('RouletteNFT');
    nft3 = await NFTTest3.deploy("Roulette", "RT", "SDAS", handler.address, owner.address);
    nftAddress3 = nft3.address;   
  });

  describe('mintERC721', function () {
    it('should Mint ERC721 token', async function () {

      await expect(handler.connect(owner).mintERC721(user1.address, nftAddress1, 1))
        .to.emit(handler, 'MintingERC721')
        .withArgs(user1.address, nftAddress1);

      const ownerOfToken = await nft1.ownerOf(1);
      expect(ownerOfToken).to.equal(user1.address);
    });

    it('should revert if random number is already used is already used', async function () {

      await handler.connect(owner).mintERC721(user1.address, nftAddress1, 1)

      await expect(handler.connect(owner).mintERC721(user1.address, nftAddress1, 1))
        .to.be.revertedWith('The number of the transaction was already used');
    });

    it('Only owner can mint', async function () {
      await expect(handler.connect(user1).mintERC721(user1.address, nftAddress1, 1))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });    

  });
});
