// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/interfaces/IOAppCore.sol";
import { MessagingFee, MessagingReceipt, MessagingParams } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";

/**
 * @title OmnichainAttendeeRegistry
 * @notice Cross-chain NFC tag registration system
 * @dev Extends OApp to enable cross-chain tag registration and verification
 * 
 * Key Features:
 * - Register tags on one chain, verify on any chain
 * - Cross-chain tag lookup
 * - Unified registration across multiple chains
 */
contract OmnichainAttendeeRegistry is OApp {
    // Local chain mapping
    mapping(bytes32 => address) public walletOf;
    
    // Cross-chain state: chainId => tagHash => wallet
    mapping(uint32 => mapping(bytes32 => address)) public crossChainWalletOf;
    
    // Track processed cross-chain messages
    mapping(bytes32 => bool) public processedMessages;
    
    // Events
    event TagRegistered(bytes32 indexed tagHash, address indexed wallet, uint32 chainId);
    event CrossChainRegistrationInitiated(
        uint32 dstEid,
        bytes32 tagHash,
        address wallet,
        bytes32 messageId
    );
    event CrossChainRegistrationReceived(
        uint32 srcEid,
        bytes32 tagHash,
        address wallet
    );
    event CrossChainQueryInitiated(
        uint32 dstEid,
        bytes32 tagHash,
        bytes32 messageId
    );

    constructor(
        address _endpoint,
        address _owner
    ) OApp(_endpoint, _owner) {
        // OApp initializes endpoint and delegate
        // Note: OAppCore inherits from Ownable but doesn't call constructor
        // This may require OpenZeppelin v4 or a patch
    }

    /**
     * @notice Register a tag locally
     */
    function registerTag(bytes32 tagHash, address wallet) external {
        require(wallet != address(0), "Wallet cannot be zero address");
        require(walletOf[tagHash] == address(0), "Tag already registered");

        walletOf[tagHash] = wallet;
        emit TagRegistered(tagHash, wallet, uint32(block.chainid));
    }

    /**
     * @notice Register tag locally and broadcast to other chains
     * @param _dstEids Array of destination chain endpoint IDs
     * @param tagHash The NFC tag hash
     * @param wallet The wallet address to register
     * @param _options Additional LayerZero options
     */
    function registerTagCrossChain(
        uint32[] calldata _dstEids,
        bytes32 tagHash,
        address wallet,
        bytes calldata _options
    ) external payable {
        require(wallet != address(0), "Wallet cannot be zero address");
        require(walletOf[tagHash] == address(0), "Tag already registered");

        // Register locally first
        walletOf[tagHash] = wallet;
        emit TagRegistered(tagHash, wallet, uint32(block.chainid));

        // Broadcast to other chains
        bytes memory _payload = abi.encode(tagHash, wallet);
        
        for (uint i = 0; i < _dstEids.length; i++) {
            uint32 _dstEid = _dstEids[i];
            
            MessagingFee memory fee = _quote(_dstEid, _payload, _options, false);
            require(msg.value >= fee.nativeFee * _dstEids.length, "Insufficient fee");

            MessagingReceipt memory receipt = _lzSend(
                _dstEid,
                _payload,
                _options,
                fee,
                payable(msg.sender)
            );

            emit CrossChainRegistrationInitiated(_dstEid, tagHash, wallet, receipt.guid);
        }
    }

    /**
     * @notice Query tag registration on another chain
     * @param _dstEid Destination chain endpoint ID
     * @param tagHash The tag hash to query
     * @param _options Additional LayerZero options
     */
    function queryTagCrossChain(
        uint32 _dstEid,
        bytes32 tagHash,
        bytes calldata _options
    ) external payable returns (bytes32 messageId) {
        bytes memory _payload = abi.encode(tagHash, block.timestamp);

        MessagingFee memory fee = _quote(_dstEid, _payload, _options, false);
        require(msg.value >= fee.nativeFee, "Insufficient fee");

        MessagingReceipt memory receipt = _lzSend(
            _dstEid,
            _payload,
            _options,
            fee,
            payable(msg.sender)
        );

        emit CrossChainQueryInitiated(_dstEid, tagHash, receipt.guid);
        return receipt.guid;
    }

    /**
     * @notice Get wallet for tag (checks local and cross-chain)
     * @param tagHash The tag hash
     * @param chainId The chain ID to check (0 for local)
     */
    function getWalletOfTag(bytes32 tagHash, uint32 chainId) external view returns (address) {
        if (chainId == 0 || chainId == uint32(block.chainid)) {
            return walletOf[tagHash];
        }
        return crossChainWalletOf[chainId][tagHash];
    }

    /**
     * @notice LayerZero message receiver
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,
        bytes calldata _extraData
    ) internal override {
        // Check for replay
        bytes32 messageHash = keccak256(abi.encodePacked(_origin.srcEid, _origin.sender, _guid));
        require(!processedMessages[messageHash], "Message already processed");
        processedMessages[messageHash] = true;

        // Decode payload
        (bytes32 tagHash, address wallet) = abi.decode(_payload, (bytes32, address));

        // Validate
        require(wallet != address(0), "Invalid wallet");
        
        // Update cross-chain state
        crossChainWalletOf[_origin.srcEid][tagHash] = wallet;

        emit CrossChainRegistrationReceived(_origin.srcEid, tagHash, wallet);
    }

    /**
     * @notice Get quote for cross-chain operation
     */
    function _quote(
        uint32 _dstEid,
        bytes memory _payload,
        bytes memory _options,
        bool _payInLzToken
    ) internal view override returns (MessagingFee memory fee) {
        MessagingParams memory params = MessagingParams(_dstEid, _getPeerOrRevert(_dstEid), _payload, _options, _payInLzToken);
        return endpoint.quote(params, address(this));
    }
}

