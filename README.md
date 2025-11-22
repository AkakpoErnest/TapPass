# TapPass

A complete project for event registration and pass management using blockchain technology.

## Project Structure

```
TapPass/
├── contracts/          # Hardhat + Solidity smart contracts
│   ├── contracts/
│   │   ├── AttendeeRegistry.sol
│   │   └── EventPass.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   └── package.json
├── backend/            # Node.js + Express + viem
│   ├── index.js
│   ├── services/
│   │   ├── contractService.js
│   │   └── attendeeRegistry.js
│   ├── package.json
│   └── .env.example
└── android-app/        # Android NFC app (Kotlin)
    ├── app/
    │   └── src/main/
    │       ├── java/com/tappass/android/
    │       └── res/
    └── build.gradle.kts
```

## Contracts

### AttendeeRegistry.sol
A simple mapping contract that registers NFC tag hashes to wallet addresses.

**Functions:**
- `registerTag(bytes32 tagHash, address wallet)` - Register a tag hash to a wallet
- `walletOf(bytes32 tagHash)` - Get the wallet address for a tag hash

### EventPass.sol
An ERC-1155 contract for managing event passes, tickets, and POAPs.

**Token IDs:**
- `REGISTRATION_PASS = 1`
- `EVENT_TICKET = 2`
- `EVENT_POAP = 3`

**Functions:**
- `mintRegistration(address)` - Mint a registration pass (onlyOwner)
- `mintTicket(address)` - Mint an event ticket (onlyOwner)
- `mintPOAP(address)` - Mint a POAP (onlyOwner)

## Setup

### Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js
```

After deployment, copy the contract addresses to your backend `.env` file.

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your configuration:
- `PRIVATE_KEY` - Private key of the account that will send transactions (without 0x prefix)
- `RPC_URL` - RPC endpoint (default: http://localhost:8545 for Hardhat)
- `ATTENDEE_REGISTRY_ADDRESS` - Address from contract deployment
- `EVENT_PASS_ADDRESS` - EventPass contract address from deployment
- `AUTO_MINT_REGISTRATION` - Set to "true" to auto-mint registration pass after tag registration (optional)

```bash
npm start
```

**API Endpoints:**

**AttendeeRegistry:**
- `POST /register` - Register a tag hash to a wallet
  ```json
  {
    "tagHash": "0x...",
    "wallet": "0x..."
  }
  ```

- `GET /tag/:tagHash` - Get wallet address for a tag hash

**EventPass (Token Minting):**
- `POST /mint/registration` - Mint a registration pass (onlyOwner)
  ```json
  {
    "wallet": "0x..."
  }
  ```

- `POST /mint/ticket` - Mint an event ticket (onlyOwner)
  ```json
  {
    "wallet": "0x..."
  }
  ```

- `POST /mint/poap` - Mint a POAP (onlyOwner)
  ```json
  {
    "wallet": "0x..."
  }
  ```

**Token Balances:**
- `GET /balance/:wallet` - Get all token balances for a wallet
- `GET /balance/:wallet/:tokenId` - Get specific token balance
  - `tokenId`: 1 = REGISTRATION_PASS, 2 = EVENT_TICKET, 3 = EVENT_POAP

**System:**
- `GET /health` - Health check endpoint

### Android App

See `android-app/README.md` for detailed setup instructions.

**Quick Start:**
1. Open project in Android Studio
2. Update backend URL in `MainActivity.kt` (use `10.0.2.2` for emulator)
3. Build and run on NFC-enabled device

## License

MIT

