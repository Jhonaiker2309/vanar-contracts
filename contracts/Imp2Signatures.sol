// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/// @title A whitelisting via signatures example
/// @author Jhonatan Hernández
/// @notice This code has not been audited. Use at your own peril.
contract Imp2Signatures {
    address public owner;
    uint256 public data;

    constructor()  {
        owner = msg.sender;
    }

    /// @notice Hashes the address of an user along with the address of this contract
    /// @param whitelistedAgent address of the user that will be whitelisted
    /// @return bytes32 resulting hash. To be signed and given to the whitelisted user.
    function getWhitelistingHash(
        address whitelistedAgent
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(whitelistedAgent, this));
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
    /// @dev The message to validate the signature is generated on the fly with msg.sender and this contract's address.
    /// @param signature signature to be verified
    /// @return bool boolean value meaning whether the signature is valid or not
    function verify(
        bytes memory signature
    ) public view returns (bool) {
        bytes32 messageHash = getWhitelistingHash(msg.sender);
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

    /// @notice Splits a signature in it's components
    /// @param signature signature to be split
    /// @return r first number produced by the ECDSA signature
    /// @return v second number produced by the ECDSA signature
    /// @return s recovery identifier used by the ECDSA signature
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

    /// @notice Validates the signature sent by the sender to make sure that the owner made it
    /// @param signature message signed by the contract owner to validate that the sender is allowed to execute the function that uses this modifier
    modifier onlyWhitelist(bytes memory signature) {
        // validate signatures
        require(verify(signature), "Invalid Signature!");
        _;
    }

    /// @notice Allows a whitelisted user to modify the data variable
    /// @dev It uses the onlyWhitelist modifier for validation
    /// @param _data new value for the data variable
    /// @param signature message signed by the contract owner to validate that the sender is allowed to execute this function
    function changeData (uint _data, bytes calldata signature) external onlyWhitelist(signature) {
        data = _data;
    }
}
