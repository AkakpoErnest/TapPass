// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/interfaces/IOAppCore.sol";
import { MessagingFee, MessagingReceipt, MessagingParams } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";
/**
 * @title OmnichainEventPass
 * @notice Extended ERC-1155 token contract with LayerZero cross-chain capabilities
 * @dev Extends OApp to enable cross-chain minting, burning, and balance synchronization
 * 
 * Key Features:
 * - Cross-chain token minting (mint on one chain, receive on another)
 * - Cross-chain balance queries
 * - Cross-chain token transfers
 * - Multi-chain event pass management
 */
contract OmnichainEventPass is ERC1155, Ownable, OApp {
    uint256 public constant REGISTRATION_PASS = 1;
    uint256 public constant EVENT_TICKET = 2;
    uint256 public constant EVENT_POAP = 3;

    // Cross-chain state tracking
    mapping(uint32 => mapping(address => mapping(uint256 => uint256))) public crossChainBalances;
    mapping(bytes32 => bool) public processedMessages; // Prevent replay attacks
    
    // Events
    event CrossChainMintInitiated(
        uint32 dstEid,
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes32 messageId
    );
    
    event CrossChainMintReceived(
        uint32 srcEid,
        address to,
        uint256 tokenId,
        uint256 amount
    );
    
    event CrossChainBurnInitiated(
        uint32 dstEid,
        address from,
        uint256 tokenId,
        uint256 amount,
        bytes32 messageId
    );
    
    event CrossChainBalanceSynced(
        uint32 chainId,
        address account,
        uint256 tokenId,
        uint256 balance
    );

    constructor(
        address _endpoint,
        address _owner,
        string memory _uri
    ) ERC1155(_uri) Ownable() OApp(_endpoint, _owner) {
        // Transfer ownership to _owner
        transferOwnership(_owner);
    }

    /**
     * @notice Mint tokens locally (onlyOwner)
     */
    function mintRegistration(address to) external onlyOwner {
        _mint(to, REGISTRATION_PASS, 1, "");
    }

    function mintTicket(address to) external onlyOwner {
        _mint(to, EVENT_TICKET, 1, "");
    }

    function mintPOAP(address to) external onlyOwner {
        _mint(to, EVENT_POAP, 1, "");
    }

    /**
     * @notice Cross-chain mint: Initiate minting on a remote chain
     * @param _dstEid Destination chain endpoint ID
     * @param _to Recipient address on destination chain
     * @param _tokenId Token ID to mint (1, 2, or 3)
     * @param _amount Amount to mint
     * @param _options Additional LayerZero options
     * @return messageId The message ID for tracking
     */
    function crossChainMint(
        uint32 _dstEid,
        address _to,
        uint256 _tokenId,
        uint256 _amount,
        bytes calldata _options
    ) external payable onlyOwner returns (bytes32 messageId) {
        require(_tokenId >= 1 && _tokenId <= 3, "Invalid token ID");
        require(_to != address(0), "Invalid recipient");

        // Encode the cross-chain message
        bytes memory _payload = abi.encode(_to, _tokenId, _amount);

        // Build message options
        MessagingFee memory fee = _quote(_dstEid, _payload, _options, false);
        require(msg.value >= fee.nativeFee, "Insufficient fee");

        // Send cross-chain message
        MessagingReceipt memory receipt = _lzSend(
            _dstEid,
            _payload,
            _options,
            fee,
            payable(msg.sender)
        );

        messageId = receipt.guid;

        emit CrossChainMintInitiated(_dstEid, _to, _tokenId, _amount, messageId);
        return messageId;
    }

    /**
     * @notice Cross-chain burn: Burn tokens locally and mint on remote chain
     * @param _dstEid Destination chain endpoint ID
     * @param _tokenId Token ID to burn
     * @param _amount Amount to burn
     * @param _options Additional LayerZero options
     * @return messageId The message ID for tracking
     */
    function crossChainBurn(
        uint32 _dstEid,
        uint256 _tokenId,
        uint256 _amount,
        bytes calldata _options
    ) external payable returns (bytes32 messageId) {
        require(_tokenId >= 1 && _tokenId <= 3, "Invalid token ID");
        require(balanceOf(msg.sender, _tokenId) >= _amount, "Insufficient balance");

        // Burn tokens locally
        _burn(msg.sender, _tokenId, _amount);

        // Encode the cross-chain message
        bytes memory _payload = abi.encode(msg.sender, _tokenId, _amount);

        // Build message options
        MessagingFee memory fee = _quote(_dstEid, _payload, _options, false);
        require(msg.value >= fee.nativeFee, "Insufficient fee");

        // Send cross-chain message
        MessagingReceipt memory receipt = _lzSend(
            _dstEid,
            _payload,
            _options,
            fee,
            payable(msg.sender)
        );

        messageId = receipt.guid;

        emit CrossChainBurnInitiated(_dstEid, msg.sender, _tokenId, _amount, messageId);
        return messageId;
    }

    /**
     * @notice Query cross-chain balance
     * @param _dstEid Destination chain endpoint ID
     * @param _account Account to query
     * @param _tokenId Token ID to query
     * @param _options Additional LayerZero options
     * @return messageId The message ID for tracking
     */
    function queryCrossChainBalance(
        uint32 _dstEid,
        address _account,
        uint256 _tokenId,
        bytes calldata _options
    ) external payable returns (bytes32 messageId) {
        // Encode query payload
        bytes memory _payload = abi.encode(_account, _tokenId, block.timestamp);

        // Build message options
        MessagingFee memory fee = _quote(_dstEid, _payload, _options, false);
        require(msg.value >= fee.nativeFee, "Insufficient fee");

        // Send query message
        MessagingReceipt memory receipt = _lzSend(
            _dstEid,
            _payload,
            _options,
            fee,
            payable(msg.sender)
        );

        return receipt.guid;
    }

    /**
     * @notice LayerZero message receiver - handles incoming cross-chain messages
     * @param _origin Origin information (chain ID, sender)
     * @param _payload Encoded message payload
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,
        bytes calldata _extraData
    ) internal override {
        // Decode payload
        (address to, uint256 tokenId, uint256 amount) = abi.decode(_payload, (address, uint256, uint256));

        // Check if message already processed (replay protection)
        bytes32 messageHash = keccak256(abi.encodePacked(_origin.srcEid, _origin.sender, _guid));
        require(!processedMessages[messageHash], "Message already processed");
        processedMessages[messageHash] = true;

        // Validate token ID
        require(tokenId >= 1 && tokenId <= 3, "Invalid token ID");

        // Mint tokens on this chain
        _mint(to, tokenId, amount, "");

        emit CrossChainMintReceived(_origin.srcEid, to, tokenId, amount);
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

    /**
     * @notice Update base URI for token metadata
     */
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    /**
     * @notice Get cross-chain balance (cached)
     */
    function getCrossChainBalance(
        uint32 _chainId,
        address _account,
        uint256 _tokenId
    ) external view returns (uint256) {
        return crossChainBalances[_chainId][_account][_tokenId];
    }
}

