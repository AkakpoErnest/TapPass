# TapPass Backend

Node.js + Express + viem API server for TapPass event registration and token management.

## Features

- **AttendeeRegistry Integration**: Register NFC tag hashes to wallet addresses on-chain
- **EventPass Integration**: Mint ERC-1155 tokens (Registration Pass, Event Ticket, POAP)
- **Balance Queries**: Check token balances for any wallet
- **Auto-minting**: Optional automatic registration pass minting after tag registration
- **CORS Support**: Configured for Android app integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure `.env`:
```env
PORT=3000
NODE_ENV=development

# Blockchain Configuration
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=http://localhost:8545
CHAIN=hardhat

# Contract Addresses (from deployment)
ATTENDEE_REGISTRY_ADDRESS=0x...
EVENT_PASS_ADDRESS=0x...

# Optional: Auto-mint registration pass after tag registration
AUTO_MINT_REGISTRATION=false
```

4. Start server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## API Endpoints

### AttendeeRegistry

#### `POST /register`
Register an NFC tag hash to a wallet address.

**Request:**
```json
{
  "tagHash": "0x1234567890abcdef...",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag registered successfully",
  "data": {
    "tagHash": "0x...",
    "wallet": "0x...",
    "transactionHash": "0x...",
    "registrationPassMinted": false,
    "registrationPassTxHash": null
  }
}
```

#### `GET /tag/:tagHash`
Get the wallet address associated with a tag hash.

**Response:**
```json
{
  "success": true,
  "data": {
    "tagHash": "0x...",
    "wallet": "0x...",
    "isRegistered": true
  }
}
```

### EventPass (Token Minting)

All minting endpoints require the backend to be configured with the contract owner's private key.

#### `POST /mint/registration`
Mint a registration pass (Token ID: 1) to an address.

**Request:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
}
```

#### `POST /mint/ticket`
Mint an event ticket (Token ID: 2) to an address.

**Request:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
}
```

#### `POST /mint/poap`
Mint a POAP (Token ID: 3) to an address.

**Request:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
}
```

### Token Balances

#### `GET /balance/:wallet`
Get all token balances for a wallet.

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": "0x...",
    "balances": {
      "registrationPass": "1",
      "ticket": "0",
      "poap": "1"
    }
  }
}
```

#### `GET /balance/:wallet/:tokenId`
Get specific token balance.

- `tokenId`: 1 = REGISTRATION_PASS, 2 = EVENT_TICKET, 3 = EVENT_POAP

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": "0x...",
    "tokenId": 1,
    "tokenName": "REGISTRATION_PASS",
    "balance": "1"
  }
}
```

### System

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "services": {
    "attendeeRegistry": true,
    "eventPass": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- `400` - Bad Request (invalid input)
- `409` - Conflict (tag already registered)
- `500` - Internal Server Error
- `503` - Service Unavailable (contract service not initialized)

## Architecture

```
backend/
├── index.js                 # Express server and routes
├── services/
│   ├── contractService.js   # viem client initialization
│   ├── attendeeRegistry.js  # AttendeeRegistry contract service
│   └── eventPass.js         # EventPass contract service
└── package.json
```

## Security Notes

- The `PRIVATE_KEY` in `.env` should be the contract owner's private key
- Never commit `.env` file to version control
- In production, use environment variables or secure secret management
- All minting operations are restricted to the contract owner (onlyOwner modifier)

## Development

The server uses ES modules (`"type": "module"` in package.json).

For development with auto-reload:
```bash
npm run dev
```

## License

MIT

