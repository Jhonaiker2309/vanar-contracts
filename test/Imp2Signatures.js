const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const sign = async (owner, message, contract) => {
  const hash = await contract.getWhitelistingHash(message)
  const sig = await owner.signMessage(ethers.utils.arrayify(hash))
  // const ethHash = await contract.getEthSignedMessageHash(hash)

  return sig
}

describe("Imp2Signatures.sol", function () {
  async function deploy() {
    const [owner, acc1] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Imp2Signatures");
    const whitelist = await Whitelist.deploy({ });

    return { whitelist, owner, acc1 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { whitelist, owner } = await loadFixture(deploy);

      expect(await whitelist.owner()).to.equal(owner.address);
    });
  });
  describe("Whitelist ", function () {
    it("Can whitelist people", async function () {
      const { whitelist, owner, acc1 } = await loadFixture(deploy);

      // the owner signs for "acc1" and hands them the signature
      const signature = await sign(owner, acc1.address, whitelist);
      
      expect(await whitelist.data()).to.equal(0);
      // "acc1" uses the signature made by the owner to prove that they have been whitelisted
      await whitelist.connect(acc1).changeData(1, signature);
      // the change in the data has been successful
      expect(await whitelist.data()).to.equal(1);
    });
    it("Can't change data with bad signature", async function () {
      const { whitelist, owner, acc1 } = await loadFixture(deploy);

      // the owner signs for themselves instead of for the user that wants to be whitelisted
      const signature = await sign(owner, owner.address, whitelist);

      expect(await whitelist.data()).to.equal(0);
      await expect(
        whitelist.connect(acc1).changeData(1, signature)
        ).to.be.revertedWith('Invalid Signature!');
      // the change in the data has failed (as expected)
      expect(await whitelist.data()).to.equal(0);
    });
  });
});
