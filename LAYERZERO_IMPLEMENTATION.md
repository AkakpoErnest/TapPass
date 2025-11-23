# LayerZero Omnichain Implementation for TapPass

## Overview

This document outlines the LayerZero integration for TapPass to enable cross-chain event registration and token management.

## Implementation Status

### ✅ Completed

1. **OmnichainEventPass.sol** - ERC-1155 token contract with LayerZero cross-chain capabilities
   - Cross-chain minting
   - Cross-chain burning
   - Cross-chain balance queries
   - Replay protection

2. **OmnichainAttendeeRegistry.sol** - Cross-chain NFC tag registration
   - Cross-chain tag registration
   - Cross-chain tag lookup
   - Unified registration across chains

### ⚠️ Current Issues

**Compilation Error**: Constructor inheritance issue with Ownable
- OAppCore inherits from Ownable but doesn't call its constructor
- OpenZeppelin v5 requires explicit constructor call
- Need to resolve version compatibility

**Solution Options**:
1. Use OpenZeppelin v4 (compatible with LayerZero packages)
2. Patch OAppCore to call Ownable constructor
3. Use a wrapper contract approach

## Architecture

### Contracts

```
OmnichainEventPass
├── ERC1155 (OpenZeppelin)
├── Ownable (OpenZeppelin)
└── OApp (LayerZero)
    └── Cross-chain messaging
    └── Message receiving
    └── Fee quoting
```

```
OmnichainAttendeeRegistry
├── OApp (LayerZero)
└── Cross-chain state management
```

## Key Features

### 1. Cross-Chain Token Operations

**OmnichainEventPass** enables:
- `crossChainMint()` - Mint tokens on remote chain
- `crossChainBurn()` - Burn locally, mint remotely
- `queryCrossChainBalance()` - Query balances across chains

### 2. Cross-Chain Registration

**OmnichainAttendeeRegistry** enables:
- `registerTagCrossChain()` - Register tag and broadcast to multiple chains
- `queryTagCrossChain()` - Query tag registration on another chain
- `getWalletOfTag()` - Get wallet for tag (local or cross-chain)

## LayerZero Requirements Compliance

### ✅ Requirement 1: Interact with LayerZero Endpoint
- Contracts extend OApp which interacts with EndpointV2
- Uses `_lzSend()` and `_lzReceive()` for messaging

### ✅ Requirement 2: Extend Base Contract Logic
**Extensions beyond base OApp**:
1. **Replay Protection**: `processedMessages` mapping prevents duplicate message processing
2. **Cross-Chain State Tracking**: `crossChainBalances` and `crossChainWalletOf` mappings
3. **Multi-Chain Registration**: Broadcast registration to multiple chains simultaneously
4. **Token-Specific Logic**: ERC-1155 integration with cross-chain minting/burning
5. **Query System**: Cross-chain balance and tag lookup queries

### ⏳ Requirement 3: Working Demo
- Contracts need compilation fix
- Deployment scripts need LayerZero endpoint configuration
- Backend integration needed

### ⏳ Requirement 4: Feedback Form
- To be submitted after testing

## Deployment Configuration

### LayerZero Endpoint Addresses

```javascript
// Example endpoint addresses (testnet)
const endpoints = {
  ethereum: "0x...",
  arbitrum: "0x...",
  optimism: "0x...",
  base: "0x...",
  polygon: "0x..."
};
```

### Required Configuration

1. **Set Peer Addresses**: Configure peer contracts on each chain
2. **Set DVNs**: Configure Decentralized Validator Networks
3. **Set Executor**: Configure message executor
4. **Set Libraries**: Configure message libraries

## Next Steps

1. **Fix Compilation**: Resolve Ownable constructor issue
2. **Deployment Scripts**: Create multi-chain deployment script
3. **Configuration Scripts**: Scripts to set peers, DVNs, executors
4. **Backend Integration**: Add cross-chain API endpoints
5. **Testing**: Test cross-chain operations on testnets
6. **Documentation**: Complete setup and usage docs

## Usage Examples

### Cross-Chain Mint

```solidity
// Mint registration pass on Arbitrum from Ethereum
uint32 arbitrumEid = 30110;
address recipient = 0x...;
uint256 amount = 1;
bytes memory options = "";

omnichainEventPass.crossChainMint(
    arbitrumEid,
    recipient,
    REGISTRATION_PASS,
    amount,
    options
);
```

### Cross-Chain Registration

```solidity
// Register tag and broadcast to multiple chains
uint32[] memory chains = [arbitrumEid, optimismEid, baseEid];
bytes32 tagHash = keccak256("NFC_TAG_DATA");
address wallet = 0x...;

omnichainRegistry.registerTagCrossChain(
    chains,
    tagHash,
    wallet,
    options
);
```

## Security Considerations

1. **Replay Protection**: Message hash tracking prevents duplicate processing
2. **Access Control**: Only owner can initiate cross-chain mints
3. **Validation**: Input validation for addresses and token IDs
4. **Peer Verification**: Only trusted peers can send messages

## Resources

- [LayerZero Documentation](https://docs.layerzero.network)
- [OApp Guide](https://docs.layerzero.network/v2/developers/oapp)
- [Endpoint Configuration](https://docs.layerzero.network/v2/developers/endpoint)

