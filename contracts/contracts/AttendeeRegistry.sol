// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AttendeeRegistry {
    mapping(bytes32 => address) public walletOf;

    event TagRegistered(bytes32 indexed tagHash, address indexed wallet);

    function registerTag(bytes32 tagHash, address wallet) external {
        require(wallet != address(0), "Wallet cannot be zero address");
        require(walletOf[tagHash] == address(0), "Tag already registered");

        walletOf[tagHash] = wallet;
        emit TagRegistered(tagHash, wallet);
    }
}

