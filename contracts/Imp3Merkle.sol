// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Imp3Merkle {
    bytes32 private root;
    address public owner;
    uint256 public data;

    constructor(bytes32 _root)  {
        owner = msg.sender;
        root = _root;
    }

    /// @notice Verifies that the sender's address belongs to the merkle tree
    /// @param proof array of hashes needed to prove that the sender's address is part of the merkle tree
    /// @return bool boolean value representing whether the proof is valid or not
    function verifyProof(bytes32[] memory proof) private view returns(bool) {
      bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
      bytes32 computedHash = leaf;
      for (uint256 i = 0; i < proof.length; i++) {
          computedHash = computedHash < proof[i] ?
            _efficientHash(computedHash, proof[i])
            :
            _efficientHash(proof[i], computedHash);
      }
      return computedHash == root;
    }

    /// @notice Hashes two values toguether in an efficient way
    /// @param a first value to be hashed
    /// @param a second value to be hashed
    /// @return value hash of the two parameters
    function _efficientHash(bytes32 a, bytes32 b) private pure returns (bytes32 value) {
        /// @solidity memory-safe-assembly
        assembly {
            mstore(0x00, a)
            mstore(0x20, b)
            value := keccak256(0x00, 0x40)
        }
    }

    /// @notice Validates the proof sent by the sender to make sure that they are whitelisted
    /// @param merkleProof array of hashes needed to prove that the sender's address is part of the merkle tree
    modifier onlyWhitelist(bytes32[] calldata merkleProof) {
        require(verifyProof(merkleProof), "Invalid proof!");
        _;
    }

    /// @notice Allows a whitelisted user to modify the data variable
    /// @dev It uses the onlyWhitelist modifier for validation
    /// @param _data new value for the data variable
    /// @param merkleProof array of hashes needed to prove that the sender is allowed to execute this function
    function changeData (uint _data, bytes32[] calldata merkleProof) external onlyWhitelist(merkleProof) {
        data = _data;
    }
}
