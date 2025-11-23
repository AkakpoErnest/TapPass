# TapPass Testing Guide

## 🧪 Testing the Complete System

### Prerequisites

1. **Backend Running**
   ```bash
   cd backend
   npm install
   # Set up .env with contract addresses
   npm start
   ```

2. **Android App**
   - Android Studio installed
   - NFC-enabled Android device or emulator
   - Backend accessible from device (use `10.0.2.2` for emulator)

### Testing Steps

## 1. Test Backend API

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "services": {
    "attendeeRegistry": true,
    "eventPass": true,
    "omnichainEventPass": true,
    "omnichainAttendeeRegistry": true
  }
}
```

### Get Available Chains
```bash
curl http://localhost:3000/omnichain/chains
```

### Test Cross-Chain Registration
```bash
curl -X POST http://localhost:3000/omnichain/register \
  -H "Content-Type: application/json" \
  -d '{
    "tagHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "chains": ["sepolia", "arbitrumSepolia"]
  }'
```

## 2. Test Android App

### Setup

1. **Update Backend URL** in `MainActivity.kt`:
   ```kotlin
   // For emulator:
   val backendUrl = "http://10.0.2.2:3000"
   
   // For physical device (same network):
   val backendUrl = "http://YOUR_COMPUTER_IP:3000"
   ```

2. **Build and Install**:
   ```bash
   cd android-app
   # Open in Android Studio and build
   ```

### Testing Flow

1. **Open App** - Should show "Ready to scan..."

2. **Tap NFC Tag** - App should:
   - Detect the tag
   - Display tag hash
   - Show "Registering tag..."
   - Attempt cross-chain registration
   - Show success message with chains

3. **Check Status** - Should display:
   - Tag hash
   - Registration status
   - Chains registered to

## 3. Test Cross-Chain Operations

### Using Test Script

```bash
cd backend
node test-omnichain.js
```

This will test:
- Health check
- Get available chains
- Cross-chain registration
- Cross-chain minting
- Cross-chain queries

## 4. Manual Testing Checklist

### Backend Tests
- [ ] Health endpoint returns all services
- [ ] `/omnichain/chains` returns chain list
- [ ] `/omnichain/register` accepts tagHash, wallet, chains
- [ ] `/omnichain/mint` accepts wallet, tokenId, chain
- [ ] Error handling works correctly

### Android App Tests
- [ ] App launches without errors
- [ ] NFC detection works
- [ ] Tag reading extracts hash/ID
- [ ] API calls succeed
- [ ] Cross-chain registration works
- [ ] Status updates display correctly
- [ ] Error messages show on failure

### Integration Tests
- [ ] Tag registered on backend
- [ ] Cross-chain message sent
- [ ] Transaction hash returned
- [ ] Status updates in real-time

## 5. Troubleshooting

### Backend Not Responding
- Check if server is running: `curl http://localhost:3000/health`
- Check port: Default is 3000
- Check CORS: Should allow all origins for testing

### Android Can't Connect
- **Emulator**: Use `10.0.2.2` instead of `localhost`
- **Physical Device**: Use your computer's IP address
- Check firewall settings
- Ensure device and computer are on same network

### NFC Not Working
- Check if device has NFC
- Enable NFC in settings
- Try different NFC tag
- Check permissions in AndroidManifest.xml

### Cross-Chain Registration Fails
- Check if contracts are deployed
- Verify contract addresses in .env
- Check if LayerZero endpoints are configured
- Ensure sufficient gas/fees

## 6. Expected Results

### Successful Registration
```
Tag Hash: 0x1234...
Status: Tag registered cross-chain!
Chains: sepolia, arbitrumSepolia
Transaction: 0xabcd...
```

### API Response
```json
{
  "success": true,
  "message": "Tag registered cross-chain successfully",
  "data": {
    "tagHash": "0x...",
    "wallet": "0x...",
    "chains": ["sepolia", "arbitrumSepolia"],
    "transactionHash": "0x..."
  }
}
```

## 7. Next Steps After Testing

1. **Deploy to Testnets** - Deploy contracts to Sepolia, Arbitrum Sepolia
2. **Configure Peers** - Set up LayerZero peer addresses
3. **Test Cross-Chain** - Verify tokens appear on destination chain
4. **Monitor Events** - Check LayerZero message delivery
5. **Submit Feedback** - Complete LayerZero feedback form

## 8. Test Data

### Sample Tag Hash
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Sample Wallet
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

### Available Chains
- `sepolia` - Ethereum Sepolia
- `arbitrumSepolia` - Arbitrum Sepolia
- `optimismSepolia` - Optimism Sepolia
- `baseSepolia` - Base Sepolia

