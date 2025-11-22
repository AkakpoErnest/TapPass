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
└── backend/            # Node.js + Express + viem
    ├── index.js
    ├── package.json
    └── .env.example
```

## Contracts

### AttendeeRegistry.sol
A simple mapping contract that registers NFC tag hashes to wallet addresses.

### EventPass.sol
An ERC-1155 contract for managing event passes, tickets, and POAPs.

## Setup

### Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

## License

MIT

