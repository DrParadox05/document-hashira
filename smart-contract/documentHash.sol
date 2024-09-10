// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DocumentHash is Ownable {

    /**
     * @dev Constructor that initializes the contract owner.
     * @param initialOwner The address of the initial owner.
     */
    constructor(address initialOwner) Ownable(initialOwner) {    }

    // Mapping from organization ID to their respective Merkle root
    mapping(string => bytes32) private orgMerkleRoots;

    // Event emitted when a Merkle root is stored
    event MerkleRootStored(string indexed orgId, bytes32 merkleRoot);

    /**
     * @dev Store the Merkle root for the given organization ID.
     *      Only the contract owner can call this function.
     * @param orgId The organization ID (string) to map to the Merkle root.
     * @param merkleRoot The Merkle root (bytes32) to store.
     */
    function storeMerkleRoot(string memory orgId, bytes32 merkleRoot) public onlyOwner {
        // Store the Merkle root associated with the organization ID
        orgMerkleRoots[orgId] = merkleRoot;
        emit MerkleRootStored(orgId, merkleRoot);
    }

    /**
     * @dev Retrieve the Merkle root for the given organization ID.
     * @param orgId The organization ID (string) to look up the Merkle root.
     * @return merkleRoot The Merkle root (bytes32) associated with the organization ID.
     */
    function getMerkleRoot(string memory orgId) public view returns (bytes32 merkleRoot) {
        // Return the Merkle root stored for the organization ID
        return orgMerkleRoots[orgId];
    }
}