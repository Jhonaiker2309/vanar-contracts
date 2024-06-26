// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title A Signatures contract to handle a prize roulette
/// @author Jhonaiker Blanco
/// @notice This code has not been audited. Use at your own peril.
contract VanarRouletteHandler is Ownable {

    using Strings for uint256;

    // Signature already used
    mapping(bytes => bool) private _isSignatureUsed;
    mapping(address => mapping(uint256 => bool)) private _isNftTransferred;
    mapping(address => mapping(uint256 => bool)) private _transactionDone;

    // An event that checks if an NFT was transfered
    event TransferERC721(address _userAddress, address _nftAddress, uint256 _nftId);
    event TransferERC20(address _userAddress, address _tokenAddress, uint256 _amount);

    constructor() {
    }    

    /// @notice Transfers ERC-20 tokens to a specified address.
    /// @param _userAddress The address to which tokens are transferred.
    /// @param _tokenAddress The address of the ERC-20 token contract.
    /// @param _amount The amount of tokens to transfer.
    /// @param _transactionNumber The number of the transaction
    /// @param _signature The signature for verification.
    /// @dev Requires a valid signature from the owner of this contract.
    function transferERC20(
        address _userAddress,
        address _tokenAddress,
        uint256 _amount,
        uint256 _transactionNumber,
        bytes memory _signature
    ) 
    checkIfSignatureWasAlreadyUsed(_signature)
    checkIfUserAlreadyDidTransaction(_userAddress, _transactionNumber)
    public 
    {
        // Ensure the signature is valid
        require(verify(_userAddress, _tokenAddress, 0, false, _amount, _transactionNumber,_signature), "Signature not valid");

        _isSignatureUsed[_signature] = true;
        _transactionDone[_userAddress][_transactionNumber] = true;

        // Transfer tokens assuming the contract is the owner
        IERC20(_tokenAddress).transfer(_userAddress, _amount);

        emit TransferERC20(_userAddress, _tokenAddress, _amount);
    }

    /// @notice Transfers ERC-721 tokens to a specified address.
    /// @param _userAddress The address to which tokens are transferred.
    /// @param _nftAddress The address of the ERC-721 token contract.
    /// @param _nftId The ID of the ERC-721 token to transfer.
    /// @param _transactionNumber The number of the transaction
    /// @param _signature The signature for verification.
    /// @dev Requires a valid signature from the owner of this contract.
    function transferERC721(
        address _userAddress,
        address _nftAddress,
        uint256 _nftId,
        uint256 _transactionNumber,
        bytes memory _signature
    )
    checkIfSignatureWasAlreadyUsed(_signature)
    checkIfNFTWasAlreadyTransferred(_nftAddress, _nftId)
    checkIfUserAlreadyDidTransaction(_userAddress, _transactionNumber)
    public
    {
        // Ensure the signature is valid
        require(verify(_userAddress, _nftAddress, _nftId, true, 1, _transactionNumber,_signature), "Signature not valid");

        _isSignatureUsed[_signature] = true;
        _isNftTransferred[_nftAddress][_nftId] = true;
        _transactionDone[_userAddress][_transactionNumber] = true;

        // Assuming the contract itself is the owner of the token
        IERC721(_nftAddress).safeTransferFrom(address(this), _userAddress, _nftId);

        emit TransferERC721(_userAddress, _nftAddress, _nftId);
    }


    /// @notice Hashes a user address, a nft address and the nft id
    /// @param _userAddress The address of the user
    /// @param _tokenAddress The address of the token
    /// @param _nftId The id of the timestamp of the nft    
    /// @param _isNFT Parameter that checks if the we are transfering a erc721 token
    /// @param _amount The amount of tokens to transfer
    /// @param _transactionNumber The number of the transaction
    /// @return bytes32 resulting hash. To be signed and given to the user.
    function getHash(
        address _userAddress,
        address _tokenAddress,
        uint256 _nftId,
        bool _isNFT,
        uint256 _amount,
        uint256 _transactionNumber
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(_userAddress, _tokenAddress, _nftId, _isNFT, _amount,_transactionNumber ,this));
    }

    /// @notice Hashes toguether a string and a hash
    /// @param _messageHash the hash to be hashed along with the string
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
    /// @dev The message to validate the signature is generated on the fly.
    /// @param _userAddress The address of the user
    /// @param _tokenAddress The address of the nft
    /// @param _nftId The id of the nft
    /// @param _isNFT Parameter that checks if the we are transfering a erc721 token
    /// @param _amount The amount of tokens to transfer    
    /// @param _transactionNumber The number of the transaction
    /// @param _signature Signature to be verified
    
    /// @return bool Boolean value indicating whether the signature is valid or not
    function verify(
        address _userAddress,
        address _tokenAddress,
        uint256 _nftId,
        bool _isNFT,
        uint256 _amount,
        uint256 _transactionNumber,
        bytes memory _signature
    ) private view returns (bool) {
        bytes32 messageHash = getHash(_userAddress, _tokenAddress, _nftId, _isNFT, _amount, _transactionNumber);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, _signature) == owner();
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

    /// @notice Function to check if user already minted NFT
    /// @param _nftAddress The address of the nft
    /// @param _nftId The id of the nft
    /// @return _isMinted Is the nft minted?
    function getIfNFTWasAlreadyTransfered(address _nftAddress, uint256 _nftId) external view returns (bool _isMinted) {
        return _isNftTransferred[_nftAddress][_nftId];
    }

    
    /// @notice Modifier that checks if the contract already transfered the NFT
    /// @param _nftAddress The address of the NFT
    /// @param _nftId The id of the NFT
    modifier checkIfNFTWasAlreadyTransferred(address _nftAddress, uint256 _nftId) {
        require(_isNftTransferred[_nftAddress][_nftId] == false, "This NFT was already transfered");
        _;
    }

    /// @notice Modifier that checks if the signature was already used
    /// @param _signature The id of the timestamp of the NFT
    modifier checkIfSignatureWasAlreadyUsed(bytes memory _signature) {
        require(_isSignatureUsed[_signature] == false, "The signature was already used");
        _;
    }    

    /// @notice Modifier that checks if the transaction number was already used
    /// @param _userAddress The address of the user
    /// @param _transactionNumber The number of the transaction
    modifier checkIfUserAlreadyDidTransaction(address _userAddress, uint256 _transactionNumber) {
        require(_transactionDone[_userAddress][_transactionNumber] == false, "The number of the transaction was already used");
        _;
    }       
}
