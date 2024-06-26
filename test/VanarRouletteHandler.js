// SPDX-License-Identifier: UNLICENSED
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('VanarRouletteHandler', function () {
  let owner, user1, tokenAddress, nftAddress, token, nft;
  let handler;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy the contract
    const VanarRouletteHandler = await ethers.getContractFactory('VanarRouletteHandler');
    handler = await VanarRouletteHandler.deploy();
    await handler.deployed();

    // Deploy ERC20 token for testing
    const ERC20Mock = await ethers.getContractFactory('MyERC20Token');
    token = await ERC20Mock.deploy();
    tokenAddress = token.address;

    // Deploy ERC721 token for testing
    const ERC721Mock = await ethers.getContractFactory('MyERC721Token');
    nft = await ERC721Mock.deploy();
    nftAddress = nft.address;

    // Mint tokens for testing
    await token.mint(handler.address, ethers.utils.parseEther('1000'));
    await nft.mint(handler.address);
    await nft.mint(handler.address);
    await nft.mint(handler.address);
    await nft.mint(handler.address);
    await nft.mint(handler.address);
    await nft.mint(handler.address);
  });

  describe('transferERC20', function () {
    it('should transfer ERC20 tokens with valid signature', async function () {
      const amount = ethers.utils.parseEther('100');
      const messageHash = await handler.getHash(user1.address, tokenAddress, 0, false, amount, 1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await expect(handler.transferERC20(user1.address, tokenAddress, amount,1, signature))
        .to.emit(handler, 'TransferERC20')
        .withArgs(user1.address, tokenAddress, amount);

      const balance = await token.balanceOf(user1.address);
      expect(balance).to.equal(amount);
    });

    it('should revert if signature is already used', async function () {
      const amount = ethers.utils.parseEther('100');
      const messageHash = await handler.getHash(user1.address, tokenAddress, 0, false, amount, 1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await handler.transferERC20(user1.address, tokenAddress, amount, 1, signature );

      await expect(handler.transferERC20(user1.address, tokenAddress, amount,1, signature))
        .to.be.revertedWith('The signature was already used');
    });

    it('should revert if signature is invalid', async function () {
      const amount = ethers.utils.parseEther('100');
      const invalidSignature = ethers.utils.hexlify(ethers.utils.randomBytes(65));
      await expect(handler.transferERC20(user1.address, tokenAddress, amount,1, invalidSignature))
        .to.be.revertedWith('Signature not valid');
    });
  });

  describe('transferERC721', function () {
    it('should transfer ERC721 tokens with valid signature', async function () {
      const messageHash = await handler.getHash(user1.address, nftAddress, 1, true, 1, 1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await expect(handler.transferERC721(user1.address, nftAddress, 1,1, signature))
        .to.emit(handler, 'TransferERC721')
        .withArgs(user1.address, nftAddress, 1);

      const ownerOfToken = await nft.ownerOf(1);
      expect(ownerOfToken).to.equal(user1.address);
    });

    it('should revert if signature is already used', async function () {
      const messageHash = await handler.getHash(user1.address, nftAddress, 1, true, 1, 1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await handler.transferERC721(user1.address, nftAddress, 1, 1,signature);

      await expect(handler.transferERC721(user1.address, nftAddress, 1, 1, signature))
        .to.be.revertedWith('The signature was already used');
    });

    it('should revert if signature is invalid', async function () {
      const invalidSignature = ethers.utils.hexlify(ethers.utils.randomBytes(65));

      await expect(handler.transferERC721(user1.address, nftAddress, 1, 1,invalidSignature))
        .to.be.revertedWith('Signature not valid');
    });

    it('should revert if NFT was already transferred', async function () {
      const messageHash = await handler.getHash(user1.address, nftAddress, 1, true, 1, 1);
      const messageHash2 = await handler.getHash(user2.address, nftAddress, 1, true, 1, 2);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));
      const signature2 = await owner.signMessage(ethers.utils.arrayify(messageHash2));

      await handler.transferERC721(user1.address, nftAddress, 1, 1,signature);

      await expect(handler.transferERC721(user2.address, nftAddress, 1, 2, signature2))
        .to.be.revertedWith('This NFT was already transfered');
    });
  });
});
