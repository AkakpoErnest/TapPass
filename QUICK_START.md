# TapPass Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Backend

```bash
cd backend
npm install
npm start
```

The backend will start on `http://localhost:3000`

### Step 2: Test the Backend

Open a new terminal and test:

```bash
# Health check
curl http://localhost:3000/health

# Get available chains
curl http://localhost:3000/omnichain/chains
```

### Step 3: Test with Android App

1. **Open Android Studio**
   ```bash
   cd android-app
   # Open in Android Studio
   ```

2. **Update Backend URL** in `MainActivity.kt`:
   - For **Emulator**: `http://10.0.2.2:3000`
   - For **Physical Device**: `http://YOUR_COMPUTER_IP:3000`

3. **Build and Run**
   - Connect NFC-enabled device or emulator
   - Build and install the app
   - Tap an NFC tag to test!

## 📱 Testing the Android App

### What to Expect

1. **Open App** → Shows "Ready to scan..."
2. **Tap NFC Tag** → App detects tag
3. **Registration** → Shows "Registering tag..."
4. **Success** → Shows "Tag registered cross-chain! Chains: sepolia, arbitrumSepolia"

### Troubleshooting

**Can't connect to backend?**
- Emulator: Use `10.0.2.2` instead of `localhost`
- Physical device: Find your IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
- Check backend is running: `curl http://localhost:3000/health`

**NFC not working?**
- Enable NFC in device settings
- Try a different NFC tag
- Check device has NFC capability

**Registration fails?**
- Check backend logs for errors
- Verify contract addresses in `.env` (if deployed)
- For local testing, contracts don't need to be deployed

## 🧪 Test Without Contracts

The backend will work even without deployed contracts for testing the API:

```bash
# Test registration endpoint (will show service not initialized warning)
curl -X POST http://localhost:3000/omnichain/register \
  -H "Content-Type: application/json" \
  -d '{
    "tagHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "chains": ["sepolia"]
  }'
```

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] Android app builds successfully
- [ ] App can connect to backend
- [ ] NFC tag detection works
- [ ] Registration API call succeeds

## 🎯 Next Steps

Once basic testing works:
1. Deploy contracts to testnet
2. Update `.env` with contract addresses
3. Configure LayerZero peers
4. Test full cross-chain functionality

## 📞 Need Help?

- Check `TESTING_GUIDE.md` for detailed testing steps
- Check `NEXT_STEPS.md` for deployment guide
- Check backend logs for error messages



