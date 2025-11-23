# TapPass - Next Steps & Implementation Guide

## ✅ What's Been Completed

1. **Smart Contracts**
   - ✅ AttendeeRegistry.sol - Basic tag registration
   - ✅ EventPass.sol - ERC-1155 token contract
   - ✅ **OmnichainEventPass.sol** - Cross-chain token operations
   - ✅ **OmnichainAttendeeRegistry.sol** - Cross-chain tag registration
   - ✅ All contracts compile successfully

2. **Backend**
   - ✅ Express API server with viem integration
   - ✅ AttendeeRegistry service
   - ✅ EventPass service
   - ✅ **Omnichain services** (cross-chain operations)

3. **Android App**
   - ✅ NFC tag reading
   - ✅ API integration
   - ✅ Basic UI

4. **Deployment Scripts**
   - ✅ Basic deployment script
   - ✅ **Omnichain deployment script**
   - ✅ **LayerZero configuration script**

## 🚀 Next Steps

### 1. Deploy Contracts to Testnet

```bash
cd contracts

# Deploy to Sepolia
npx hardhat run scripts/deploy-omnichain.js --network sepolia

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy-omnichain.js --network arbitrumSepolia

# Deploy to Optimism Sepolia
npx hardhat run scripts/deploy-omnichain.js --network optimismSepolia
```

### 2. Configure LayerZero Peers

After deploying to all chains, update `configure-layerzero.js` with contract addresses:

```javascript
const PEER_CONFIG = {
  40161: "0x...", // Sepolia contract address
  40245: "0x...", // Arbitrum Sepolia contract address
  40232: "0x...", // Optimism Sepolia contract address
};
```

Then run:
```bash
npx hardhat run scripts/configure-layerzero.js --network sepolia
# Repeat for each chain
```

### 3. Update Backend Configuration

Add to `backend/.env`:
```env
# Omnichain contracts
OMNICHAIN_ATTENDEE_REGISTRY_ADDRESS=0x...
OMNICHAIN_EVENT_PASS_ADDRESS=0x...

# Chain configuration
CURRENT_CHAIN_EID=40161  # Sepolia
```

### 4. Add Cross-Chain API Endpoints

Add to `backend/index.js`:
- `POST /omnichain/register` - Cross-chain tag registration
- `POST /omnichain/mint` - Cross-chain token minting
- `GET /omnichain/tag/:tagHash/:chainId` - Query tag on specific chain

### 5. Test Cross-Chain Operations

1. Register a tag on Sepolia
2. Query the tag on Arbitrum Sepolia
3. Mint a token on Sepolia, receive on Arbitrum Sepolia
4. Verify balances across chains

### 6. Update Android App

Add UI for:
- Chain selection
- Cross-chain registration
- Cross-chain balance viewing

### 7. LayerZero Configuration

Configure:
- **DVNs (Decentralized Validator Networks)**: Set trusted validators
- **Executors**: Configure message executors
- **Libraries**: Set message libraries for each pathway

### 8. Testing Checklist

- [ ] Deploy to 2+ testnets
- [ ] Configure peers on all chains
- [ ] Test cross-chain registration
- [ ] Test cross-chain minting
- [ ] Test cross-chain queries
- [ ] Verify replay protection
- [ ] Test error handling
- [ ] Monitor gas costs

### 9. Mainnet Deployment (After Testing)

1. Update endpoint addresses in `deploy-omnichain.js`
2. Update EIDs for mainnet chains
3. Deploy to mainnet chains
4. Configure peers
5. Set up monitoring

### 10. Documentation

- [ ] Complete API documentation
- [ ] User guide for cross-chain features
- [ ] Developer setup guide
- [ ] Security audit considerations

## 📋 LayerZero Requirements Checklist

### ✅ Requirement 1: Interact with LayerZero Endpoint
- Contracts use `_lzSend()` and `_lzReceive()`
- Properly configured with endpoint addresses

### ✅ Requirement 2: Extend Base Contract Logic
- **Replay Protection**: `processedMessages` mapping
- **Cross-Chain State**: `crossChainBalances` and `crossChainWalletOf`
- **Multi-Chain Broadcasting**: Register to multiple chains at once
- **ERC-1155 Integration**: Token-specific cross-chain logic
- **Query System**: Cross-chain balance and tag queries

### ⏳ Requirement 3: Working Demo
- Contracts ready
- Need deployment and testing
- Need frontend integration

### ⏳ Requirement 4: Feedback Form
- Submit after testing and demo

## 🔧 Quick Start Commands

```bash
# Compile contracts
cd contracts && npx hardhat compile

# Deploy to local Hardhat
npx hardhat run scripts/deploy-omnichain.js

# Start backend
cd backend && npm start

# Test API
curl http://localhost:3000/health
```

## 📚 Resources

- [LayerZero Docs](https://docs.layerzero.network)
- [OApp Guide](https://docs.layerzero.network/v2/developers/oapp)
- [Endpoint Configuration](https://docs.layerzero.network/v2/developers/endpoint)
- [Testnet Endpoints](https://docs.layerzero.network/v2/developers/evm/endpoints)

## 🎯 Priority Actions

1. **Deploy to testnets** (Highest priority)
2. **Configure peers** (Required for cross-chain)
3. **Test cross-chain operations** (Validate functionality)
4. **Add backend endpoints** (Enable API access)
5. **Update Android app** (User-facing features)

