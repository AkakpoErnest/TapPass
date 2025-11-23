# TapPass Integrations

This document outlines the current integrations and recommended additional integrations for the TapPass project.

## Current Integrations ✅

### 1. **Blockchain Integration (viem)**
- **Purpose**: Interact with Ethereum-compatible blockchains
- **Location**: `backend/services/contractService.js`
- **Features**:
  - Wallet client for sending transactions
  - Public client for reading contract state
  - Support for multiple chains (Hardhat, Ethereum, etc.)

### 2. **Smart Contracts (OpenZeppelin)**
- **Purpose**: Standard, audited contract libraries
- **Location**: `contracts/contracts/`
- **Contracts Used**:
  - ERC-1155 for multi-token standard
  - Ownable for access control

### 3. **Android NFC Integration**
- **Purpose**: Read NFC tags from physical badges
- **Location**: `android-app/app/src/main/java/com/tappass/android/MainActivity.kt`
- **Features**:
  - NFC tag detection
  - NDEF message reading
  - Tag ID extraction

### 4. **HTTP Networking (OkHttp)**
- **Purpose**: API communication from Android app
- **Location**: `android-app/app/src/main/java/com/tappass/android/ApiService.kt`
- **Features**:
  - REST API calls to backend
  - JSON request/response handling

## Recommended Integrations 🚀

### 1. **IPFS / Decentralized Storage**
- **Purpose**: Store NFT metadata, images, and event data
- **Why**: Decentralized, permanent storage for token metadata
- **Options**:
  - Pinata (managed IPFS)
  - NFT.Storage (free IPFS service)
  - Web3.Storage
- **Implementation**: Update EventPass contract baseURI to IPFS URLs

### 2. **Wallet Connection (WalletConnect / MetaMask)**
- **Purpose**: Allow users to connect their wallets in the Android app
- **Why**: Users need to provide wallet addresses for registration
- **Options**:
  - WalletConnect SDK for Android
  - MetaMask Mobile SDK
  - Web3Modal
- **Implementation**: Add wallet picker/connection UI in Android app

### 3. **QR Code Generation**
- **Purpose**: Generate QR codes for event tickets/passes
- **Why**: Alternative to NFC for ticket verification
- **Options**:
  - ZXing (Android library)
  - qrcode.js (backend)
- **Implementation**: 
  - Backend: Generate QR codes with wallet/tag info
  - Android: Display QR codes for passes

### 4. **Push Notifications (Firebase Cloud Messaging)**
- **Purpose**: Notify users about event updates, ticket minting
- **Why**: Better user engagement
- **Options**:
  - Firebase Cloud Messaging (FCM)
  - OneSignal
- **Implementation**: Send notifications when tokens are minted

### 5. **Image Storage & CDN**
- **Purpose**: Store and serve event images, ticket designs
- **Why**: Need images for NFT metadata
- **Options**:
  - Cloudinary
  - AWS S3 + CloudFront
  - IPFS (decentralized option)
- **Implementation**: Upload images, store URLs in metadata

### 6. **Analytics**
- **Purpose**: Track app usage, event registrations
- **Why**: Understand user behavior and system performance
- **Options**:
  - Google Analytics
  - Mixpanel
  - Custom analytics endpoint
- **Implementation**: Track registration events, API calls

### 7. **Email Service (Optional)**
- **Purpose**: Send confirmation emails after registration
- **Why**: User confirmation and receipts
- **Options**:
  - SendGrid
  - AWS SES
  - Resend
- **Implementation**: Backend email service after successful registration

### 8. **Database (Optional)**
- **Purpose**: Cache blockchain data, store user preferences
- **Why**: Faster queries, offline data
- **Options**:
  - PostgreSQL
  - MongoDB
  - Redis (caching)
- **Implementation**: Cache tag registrations, wallet balances

### 9. **Blockchain Indexer (Optional)**
- **Purpose**: Index and query blockchain events efficiently
- **Why**: Faster queries than direct RPC calls
- **Options**:
  - The Graph
  - Alchemy Enhanced APIs
  - Moralis
- **Implementation**: Index TagRegistered events, token transfers

### 10. **Payment Gateway (Optional)**
- **Purpose**: Accept payments for event tickets
- **Why**: Monetize events
- **Options**:
  - Stripe
  - Crypto payments (native)
  - Coinbase Commerce
- **Implementation**: Payment flow before ticket minting

## Integration Priority

### Phase 1 (Essential)
1. ✅ Blockchain Integration (viem) - **DONE**
2. ✅ Smart Contracts (OpenZeppelin) - **DONE**
3. ✅ Android NFC - **DONE**
4. 🔄 **IPFS for Metadata** - High priority
5. 🔄 **Wallet Connection** - High priority

### Phase 2 (Important)
6. QR Code Generation
7. Image Storage
8. Push Notifications

### Phase 3 (Nice to Have)
9. Analytics
10. Email Service
11. Database/Caching
12. Payment Gateway

## Implementation Notes

### IPFS Integration Example
```javascript
// backend/services/ipfsService.js
import { create } from 'ipfs-http-client'

const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

export async function uploadMetadata(metadata) {
  const result = await ipfs.add(JSON.stringify(metadata))
  return `https://ipfs.io/ipfs/${result.path}`
}
```

### WalletConnect Integration Example
```kotlin
// android-app: Add WalletConnect dependency
implementation("com.walletconnect:android-core:2.x.x")

// Connect wallet in Android app
val walletConnect = WalletConnect(this)
walletConnect.connect()
```

## Environment Variables Needed

Add to `backend/.env.example`:
```env
# IPFS
IPFS_API_URL=https://ipfs.infura.io:5001/api/v0
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# WalletConnect
WALLETCONNECT_PROJECT_ID=your_project_id

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key

# Analytics
ANALYTICS_API_KEY=your_key

# Email
SENDGRID_API_KEY=your_key
```

## Next Steps

1. **Choose IPFS provider** and implement metadata upload
2. **Add WalletConnect** to Android app for wallet selection
3. **Implement QR code generation** for tickets
4. **Set up image storage** for NFT metadata
5. **Add push notifications** for user engagement

