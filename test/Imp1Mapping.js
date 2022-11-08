const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Imp1Mapping.sol", function () {
  async function deploy() {
    const [owner, acc1] = await ethers.getSigners();

    const Whitelist = await ethers.getContractFactory("Imp1Mapping");
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
      const { whitelist, acc1 } = await loadFixture(deploy);
      await whitelist.whitelistAddress(acc1.address)
      expect(await whitelist.data()).to.equal(0);
      await whitelist.connect(acc1).changeData(1);
      expect(await whitelist.data()).to.equal(1);
    });
    it("Can't change data without whitelisting", async function () {
      const { whitelist, acc1 } = await loadFixture(deploy);
      expect(await whitelist.data()).to.equal(0);
      await expect(
        whitelist.connect(acc1).changeData(1)
        ).to.be.revertedWith('Not whitelisted');
      expect(await whitelist.data()).to.equal(0);
    });
  });
});
