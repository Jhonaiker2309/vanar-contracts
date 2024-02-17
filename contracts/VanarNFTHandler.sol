// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title An ERC1155 with signatures contract
/// @author Jhonaiker Blanco
/// @notice This code has not been audited. Use at your own peril.
contract VanarNFTHandler is ERC1155 {

    // Address of the deployer
    address public owner;

    // The name of the Collection
    string public name = "Vanar Collection";

    // Mapping that checks if an address already minted an NFT with the given timestamp id
    mapping(address => mapping(uint256 => bool)) public _alreadyMintedTimestampNFT;

    // An event that checks if an NFT was minted
    event MintMessage(address minter, uint256 timestampId);

    constructor() ERC1155("https://vanar-backend.vercel.app/token/{id}.json") {
        owner = msg.sender;
    }    

    /// @notice A function that checks if the user hasn't minted an NFT with the given id and that checks if the user has a valid signature
    //          given by the owner, in case that that's true the user can mint an NFT     
    /// @param _timestampId The id of the timestamp of the nft
    /// @param signature A signature give for the owner to allow the user to mint
    function mint(uint256 _timestampId, bytes memory signature) checkIfUserAlreadyMintedTimestampNFT(msg.sender, _timestampId) public {
        require(verify(msg.sender, _timestampId, signature) == true, "Signature not valid");      
        _alreadyMintedTimestampNFT[msg.sender][_timestampId] = true;  
        _mint(msg.sender, _timestampId, 1, "");
        emit MintMessage(msg.sender, _timestampId);
    }

    /// @notice Hashes a user address, a random number, the string of an nft and a secret string along with the address of this contract
    /// @param _userAddress The address of the user
    /// @param _timestampId The id of the timestamp of the nft
    /// @return bytes32 resulting hash. To be signed and given to the user.
    function getHash(
        address _userAddress,
        uint256 _timestampId
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(_userAddress,_timestampId,this));
    }

    /// @notice Hashes toguether a string and a hash
    /// @param _messageHash the hash to be hashed algong with the string
    /// @return bytes32 The resulting hash
    function getEthSignedMessageHash(
        bytes32 _messageHash
    ) private pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    /// @notice Verifies the validity of a signature
    /// @dev The message to validate the signature is generated on the fly with a random number, the string of an NFT, and this contract's address.
    /// @param _userAddress  The address of the user
    /// @param _timestampId The id of the timestamp of the nft
    /// @param signature Signature to be verified
    /// @return bool Boolean value indicating whether the signature is valid or not
    function verify(
        address _userAddress,
        uint256 _timestampId,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 messageHash = getHash(_userAddress, _timestampId);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, signature) == owner;
}

    /// @notice gets a signer out of a signature and the hash of the signed message
    /// @param _ethSignedMessageHash hash of the signed message
    /// @param _signature signature to be verified
    /// @return address Address of the signer
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    /// @notice Splits a signature in its components
    /// @param signature signature to be split
    /// @return r first number produced by the ECDSA signature
    /// @return s second number produced by the ECDSA signature
    /// @return v recovery identifier used by the ECDSA signature
    function splitSignature(bytes memory signature)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(signature.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */
            // first 32 bytes, after the length prefix
            r := mload(add(signature, 32))
            // second 32 bytes
            s := mload(add(signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }

        // implicitly return (r, s, v)
    }

    /// @param newBaseURI The new ERC1155 of the tokens
    function setBaseURI(string memory newBaseURI) external {
        require(owner == msg.sender, "Only the owner can do this");
        _setURI(newBaseURI);
    }

    /// @notice Modifier that checks if user already minted the NFT of the timestamp that he wants
    /// @param _user The user that is trying to mint the NFT
    /// @param _timestampId The id of the timestamp of the NFT
    modifier checkIfUserAlreadyMintedTimestampNFT(address _user, uint256 _timestampId) {
        require(_alreadyMintedTimestampNFT[_user][_timestampId] == false, "The user already minted this NFT");
        _;
    }
}
