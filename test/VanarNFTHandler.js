const { loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const sign = async (account, timestampId,secretCode,contract) => {
  const hash = await contract.getHash(account.address, timestampId,secretCode)
  const sig = await account.signMessage(ethers.utils.arrayify(hash))

  return sig
}

describe("VanarNFTHandler.sol", function () {
  async function deploy() {
    const [acc1, acc2] = await ethers.getSigners();

    const VanarNFTHandler = await ethers.getContractFactory("VanarNFTHandler");
    const vanarNFTHandler = await VanarNFTHandler.deploy({ });

    return { vanarNFTHandler, acc1, acc2 };
  }

  describe("Signatures checking ", function () {
    it("Signatures returns true when it's valid", async function () {
      const timestampId = 1
      const testSecretCode = "secret"

      const { vanarNFTHandler, acc1 } = await loadFixture(deploy);

      const signature = await sign(acc1, timestampId,testSecretCode, vanarNFTHandler);

      expect(await vanarNFTHandler.connect(acc1).verify(acc1.address,timestampId,testSecretCode, signature )).to.equal(true);
    
    })

    it("Signatures returns false when it's not valid", async function () {
      const timestampId = 1
      const testSecretCode = "secret1"
      const testSecretCodeFake = "secret2"

      const { vanarNFTHandler, acc1 } = await loadFixture(deploy);

      const signature = await sign(acc1, timestampId,testSecretCode, vanarNFTHandler);

      expect(await vanarNFTHandler.connect(acc1).verify(acc1.address,timestampId,testSecretCodeFake, signature )).to.equal(false);
    });

  });

  describe("ERC1155 Minting ", function () {
    it("Mint working", async function () {
      const timestampId = 1
      const testSecretCode = "secret"

      const { vanarNFTHandler, acc1 } = await loadFixture(deploy);

      const signature = await sign(acc1, timestampId,testSecretCode, vanarNFTHandler);

      expect(await vanarNFTHandler.connect(acc1).balanceOf(acc1.address, timestampId)).to.equal(0)

      await vanarNFTHandler.connect(acc1).mint(timestampId, testSecretCode, signature)

      expect(await vanarNFTHandler.connect(acc1).balanceOf(acc1.address, timestampId)).to.equal(1)
    
    })

    it("Can't mint with error in signature", async function () {
      const timestampId = 1
      const testSecretCode = "secret"
      const testSecretCodeFake = "secret2"

      const { vanarNFTHandler, acc1 } = await loadFixture(deploy);

      const signature = await sign(acc1, timestampId,testSecretCode, vanarNFTHandler);

      await expect(vanarNFTHandler.connect(acc1).mint(timestampId, testSecretCodeFake, signature)).to.be.revertedWith("Signature not valid")
    
    })    

    it("Can't mint with signature of wrong user", async function () {
      const timestampId = 1
      const testSecretCode = "secret"

      const { vanarNFTHandler, acc2 } = await loadFixture(deploy);

      const signature = await sign(acc2, timestampId,testSecretCode, vanarNFTHandler);

      await expect(vanarNFTHandler.connect(acc2).mint(timestampId,testSecretCode, signature )).to.be.revertedWith("Signature not valid")
    })      

    it("Can't mint twice the same token", async function () {
      const timestampId = 1
      const testSecretCode = "secret"

      const { vanarNFTHandler, acc1 } = await loadFixture(deploy);

      const signature = await sign(acc1, timestampId,testSecretCode, vanarNFTHandler);

      await vanarNFTHandler.connect(acc1).mint(timestampId, testSecretCode, signature)

      await expect(vanarNFTHandler.connect(acc1).mint(timestampId, testSecretCode, signature)).to.be.revertedWith("The user already minted this NFT")
    });

    it("Can mint 2 different tokens", async function () {
      const timestampId1 = 1
      const timestampId2 = 2
      const testSecretCode = "secret"

      const { vanarNFTHandler, acc1 } = await loadFixture(deploy);

      const signature1 = await sign(acc1, timestampId1,testSecretCode, vanarNFTHandler);
      const signature2 = await sign(acc1, timestampId2,testSecretCode, vanarNFTHandler);

      expect(await vanarNFTHandler.connect(acc1).balanceOf(acc1.address, timestampId1)).to.equal(0)
      expect(await vanarNFTHandler.connect(acc1).balanceOf(acc1.address, timestampId2)).to.equal(0)

      await vanarNFTHandler.connect(acc1).mint(timestampId1, testSecretCode, signature1)
      await vanarNFTHandler.connect(acc1).mint(timestampId2, testSecretCode, signature2)

      expect(await vanarNFTHandler.connect(acc1).balanceOf(acc1.address, timestampId1)).to.equal(1)
      expect(await vanarNFTHandler.connect(acc1).balanceOf(acc1.address, timestampId2)).to.equal(1)
    });

  });  
});

