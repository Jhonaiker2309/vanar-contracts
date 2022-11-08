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

const leafNodes = whitelistedAddresses.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});

// 4. Get root hash of the `merkleeTree` in hexadecimal format (0x)
// Print out the Entire Merkle Tree.
const rootHash = merkleTree.getRoot();
console.log(rootHash);

console.log('Whitelist Merkle Tree\n', merkleTree.toString());
console.log('Nodes\n', leafNodes);
