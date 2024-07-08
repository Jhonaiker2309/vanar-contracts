// SPDX-License-Identifier: UNLICENSED
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('VanarRouletteHandler', function () {
  let owner, user1, tokenAddress1,tokenAddress2,tokenAddress3, nftAddress1,nftAddress2,nftAddress3, token1,token2,token3, nft1,nft2,nft3;
  let handler;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy the contract
    const VanarRouletteHandler = await ethers.getContractFactory('VanarRouletteHandler');
    handler = await VanarRouletteHandler.deploy();
    await handler.deployed();

    // Deploy ERC20 tokens for testing
    const Token1 = await ethers.getContractFactory('Token1');
    token1 = await Token1.deploy();
    tokenAddress1 = token1.address;

    const Token2 = await ethers.getContractFactory('Token2');
    token2 = await Token2.deploy();
    tokenAddress2 = token2.address;
    
    const Token3 = await ethers.getContractFactory('Token3');
    token3 = await Token3.deploy();
    tokenAddress3 = token3.address;    

    // Deploy ERC721 tokens for testing
    const NFTTest1 = await ethers.getContractFactory('NFTTest1');
    nft1 = await NFTTest1.deploy();
    nftAddress1 = nft1.address;

    const NFTTest2 = await ethers.getContractFactory('NFTTest2');
    nft2 = await NFTTest2.deploy();
    nftAddress2 = nft2.address;
    
    const NFTTest3 = await ethers.getContractFactory('NFTTest3');
    nft3 = await NFTTest3.deploy();
    nftAddress3 = nft3.address;      

    // Mint tokens for testing
    await token1.mint(handler.address, ethers.utils.parseEther('1000'));
    await token1.mint(handler.address, ethers.utils.parseEther('1000'));
    await token1.mint(handler.address, ethers.utils.parseEther('1000'));

    await nft1.transferOwnership(handler.address)
    await nft2.transferOwnership(handler.address)
    await nft3.transferOwnership(handler.address)
  });

  describe('transferERC20', function () {
    it('should transfer ERC20 tokens with valid signature', async function () {
      const amount = ethers.utils.parseEther('100');
      const messageHash = await handler.getHashTransferERC20(user1.address, tokenAddress1, amount, 1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await expect(handler.transferERC20(user1.address, tokenAddress1, amount,1, signature))
        .to.emit(handler, 'TransferERC20')
        .withArgs(user1.address, tokenAddress1, amount);

      const balance = await token1.balanceOf(user1.address);
      expect(balance).to.equal(amount);
    });

    it('should revert if signature is already used', async function () {
      const amount = ethers.utils.parseEther('100');
      const messageHash = await handler.getHashTransferERC20(user1.address, tokenAddress1, amount, 1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await handler.transferERC20(user1.address, tokenAddress1, amount,1, signature);

      await expect(handler.transferERC20(user1.address, tokenAddress1, amount,1, signature))
        .to.be.revertedWith('The signature was already used');
    });

    it('should revert if signature is invalid', async function () {
      const amount = ethers.utils.parseEther('100');
      const invalidSignature = ethers.utils.hexlify(ethers.utils.randomBytes(65));
      await expect(handler.transferERC20(user1.address, tokenAddress1, amount,1, invalidSignature))
        .to.be.revertedWith('Signature not valid');
    });
  });

  describe('mintERC721', function () {
    it('should Mint ERC721 tokens with valid signature', async function () {

      const messageHash = await handler.getHashMintERC721(user1.address, nftAddress1, 1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await expect(handler.mintERC721(user1.address, nftAddress1, 1, signature))
        .to.emit(handler, 'MintingERC721')
        .withArgs(user1.address, nftAddress1);

      const ownerOfToken = await nft1.ownerOf(1);
      expect(ownerOfToken).to.equal(user1.address);
    });

    it('should revert if signature is already used', async function () {
      const messageHash = await handler.getHashMintERC721(user1.address, nftAddress1, 1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      handler.mintERC721(user1.address, nftAddress1, 1, signature)

      await expect(handler.mintERC721(user1.address, nftAddress1, 1, signature))
        .to.be.revertedWith('The signature was already used');
    });

    it('should revert if signature is invalid', async function () {
      const invalidSignature = ethers.utils.hexlify(ethers.utils.randomBytes(65));

      await expect(handler.mintERC721(user1.address, nftAddress1, 1, invalidSignature))
        .to.be.revertedWith('Signature not valid');
    });

  });

  describe('Get mix prizes', function () {
    it('should Mint ERC721 token and get ERC20 Tokens with valid signature', async function () {
      const amount = ethers.utils.parseEther('100');
      const messageHash = await handler.getHashMixTransaction(user1.address, tokenAddress1,nftAddress1,amount ,1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await expect(handler.mixTransaction(user1.address, tokenAddress1,nftAddress1,amount ,1, signature))
      .to.emit(handler, 'MintingERC721')
      .withArgs(user1.address, nftAddress1)
      .and.to.emit(handler, 'TransferERC20')
      .withArgs(user1.address, tokenAddress1, amount);

      const ownerOfToken = await nft1.ownerOf(1);
      expect(ownerOfToken).to.equal(user1.address);

      const balance = await token1.balanceOf(user1.address);
      expect(balance).to.equal(amount);
    });

    it('should revert if signature is already used', async function () {
      const amount = ethers.utils.parseEther('100');
      const messageHash = await handler.getHashMixTransaction(user1.address, tokenAddress1,nftAddress1,amount ,1);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));

      await handler.mixTransaction(user1.address, tokenAddress1,nftAddress1,amount ,1, signature)

      await expect(handler.mixTransaction(user1.address, tokenAddress1,nftAddress1,amount ,1, signature))
        .to.be.revertedWith('The signature was already used');
    });

    it('should revert if signature is invalid', async function () {
      const amount = ethers.utils.parseEther('100');
      const invalidSignature = ethers.utils.hexlify(ethers.utils.randomBytes(65));

      await expect(handler.mixTransaction(user1.address, tokenAddress1,nftAddress1,amount ,1, invalidSignature))
        .to.be.revertedWith('Signature not valid');
    });

  });  
});
