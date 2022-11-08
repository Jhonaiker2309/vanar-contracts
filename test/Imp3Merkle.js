
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

const whitelistedAddresses = [
  "0X5B38DA6A701C568545DCFCB03FCB875F56BEDDC4",
  "0X5A641E5FB72A2FD9137312E7694D42996D689D99",
  "0XDCAB482177A592E424D1C8318A464FC922E8DE40",
  "0X6E21D37E07A6F7E53C7ACE372CEC63D4AE4B6BD0",
  "0X09BAAB19FC77C19898140DADD30C4685C597620B",
  "0XCC4C29997177253376528C05D3DF91CF2D69061A",
  "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
  '0x5C3050b5f8F83906F1e1Fcdbd3545A24F3f75aBE',
  '0x42261b574358b4EE8ad3D43FB416B4D82D61CD93',
]


describe("Imp3Merkle.sol", function () {
  async function deploy() {
    const [owner, acc1, acc2] = await ethers.getSigners();

    const leafNodes = whitelistedAddresses.concat([acc1.address]).map(addr => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});

    const acc1Proof = merkleTree.getHexProof(keccak256(acc1.address));

    const Whitelist = await ethers.getContractFactory("Imp3Merkle");
    const whitelist = await Whitelist.deploy(merkleTree.getRoot(), { });

    return { whitelist, owner, acc1, acc1Proof, acc2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { whitelist, owner } = await loadFixture(deploy);

      expect(await whitelist.owner()).to.equal(owner.address);
    });
  });
  describe("Whitelist ", function () {
    it("Can whitelist people", async function () {
      const { whitelist, acc1, acc1Proof } = await loadFixture(deploy);

      expect(await whitelist.data()).to.equal(0);
      await whitelist.connect(acc1).changeData(1, acc1Proof);
      expect(await whitelist.data()).to.equal(1);
    });
    it("Can't change data without using the correct proof", async function () {
      const { whitelist, acc2, acc1Proof } = await loadFixture(deploy);
      expect(await whitelist.data()).to.equal(0);
      await expect(
        whitelist.connect(acc2).changeData(1, acc1Proof)
        ).to.be.revertedWith('Invalid proof!');
      expect(await whitelist.data()).to.equal(0);
    });
  });
});
