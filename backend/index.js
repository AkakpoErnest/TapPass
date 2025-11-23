import express from "express";
import dotenv from "dotenv";
import { initializeContractService } from "./services/contractService.js";
import { AttendeeRegistryService } from "./services/attendeeRegistry.js";
import { EventPassService } from "./services/eventPass.js";
import { OmnichainEventPassService, OmnichainAttendeeRegistryService, CHAIN_EIDS } from "./services/omnichainService.js";
import { hardhat } from "viem/chains";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware for Android app
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Initialize contract services
let attendeeRegistryService;
let eventPassService;
let omnichainEventPassService;
let omnichainAttendeeRegistryService;

try {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL || "http://localhost:8545";
  const chain = process.env.CHAIN === "hardhat" ? hardhat : hardhat;

  if (privateKey) {
    initializeContractService(privateKey, rpcUrl, chain);
    console.log("Contract service initialized");
  } else {
    console.warn("WARNING: PRIVATE_KEY not set. Contract interactions will fail.");
  }

  const attendeeRegistryAddress = process.env.ATTENDEE_REGISTRY_ADDRESS;
  if (attendeeRegistryAddress) {
    attendeeRegistryService = new AttendeeRegistryService(attendeeRegistryAddress);
    console.log(`AttendeeRegistry service initialized at: ${attendeeRegistryAddress}`);
  } else {
    console.warn("WARNING: ATTENDEE_REGISTRY_ADDRESS not set. Registration will fail.");
  }

  const eventPassAddress = process.env.EVENT_PASS_ADDRESS;
  if (eventPassAddress) {
    eventPassService = new EventPassService(eventPassAddress);
    console.log(`EventPass service initialized at: ${eventPassAddress}`);
  } else {
    console.warn("WARNING: EVENT_PASS_ADDRESS not set. Token minting will fail.");
  }

  // Initialize Omnichain services
  const omnichainEventPassAddress = process.env.OMNICHAIN_EVENT_PASS_ADDRESS;
  if (omnichainEventPassAddress) {
    omnichainEventPassService = new OmnichainEventPassService(omnichainEventPassAddress);
    console.log(`OmnichainEventPass service initialized at: ${omnichainEventPassAddress}`);
  } else {
    console.warn("WARNING: OMNICHAIN_EVENT_PASS_ADDRESS not set. Cross-chain operations will fail.");
  }

  const omnichainRegistryAddress = process.env.OMNICHAIN_ATTENDEE_REGISTRY_ADDRESS;
  if (omnichainRegistryAddress) {
    omnichainAttendeeRegistryService = new OmnichainAttendeeRegistryService(omnichainRegistryAddress);
    console.log(`OmnichainAttendeeRegistry service initialized at: ${omnichainRegistryAddress}`);
  } else {
    console.warn("WARNING: OMNICHAIN_ATTENDEE_REGISTRY_ADDRESS not set. Cross-chain registration will fail.");
  }
} catch (error) {
  console.error("Error initializing contract service:", error);
}

// POST /register route
app.post("/register", async (req, res) => {
  try {
    const { tagHash, wallet } = req.body;

    if (!tagHash || !wallet) {
      return res.status(400).json({ 
        success: false,
        error: "tagHash and wallet are required" 
      });
    }

    if (!attendeeRegistryService) {
      return res.status(503).json({ 
        success: false,
        error: "Contract service not initialized. Check server configuration." 
      });
    }

    // Register tag on blockchain
    const result = await attendeeRegistryService.registerTag(tagHash, wallet);

    // Optionally auto-mint registration pass after successful registration
    let mintResult = null;
    if (result.success && eventPassService && process.env.AUTO_MINT_REGISTRATION === "true") {
      try {
        mintResult = await eventPassService.mintRegistration(wallet);
      } catch (mintError) {
        console.warn("Failed to auto-mint registration pass:", mintError.message);
        // Don't fail the registration if minting fails
      }
    }

    res.json({
      success: result.success,
      message: "Tag registered successfully",
      data: {
        tagHash,
        wallet,
        transactionHash: result.hash,
        registrationPassMinted: mintResult?.success || false,
        registrationPassTxHash: mintResult?.hash || null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific error cases
    if (error.message.includes("already registered")) {
      return res.status(409).json({ 
        success: false,
        error: error.message 
      });
    }
    
    if (error.message.includes("Invalid")) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// GET /tag/:tagHash - Get wallet address for a tag
app.get("/tag/:tagHash", async (req, res) => {
  try {
    const { tagHash } = req.params;

    if (!attendeeRegistryService) {
      return res.status(503).json({ 
        success: false,
        error: "Contract service not initialized" 
      });
    }

    const wallet = await attendeeRegistryService.getWalletOfTag(tagHash);

    res.json({
      success: true,
      data: {
        tagHash,
        wallet,
        isRegistered: wallet !== "0x0000000000000000000000000000000000000000",
      },
    });
  } catch (error) {
    console.error("Error getting tag info:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// EventPass Minting Routes

// POST /mint/registration - Mint a registration pass
app.post("/mint/registration", async (req, res) => {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ 
        success: false,
        error: "wallet is required" 
      });
    }

    if (!eventPassService) {
      return res.status(503).json({ 
        success: false,
        error: "EventPass service not initialized" 
      });
    }

    const result = await eventPassService.mintRegistration(wallet);

    res.json({
      success: result.success,
      message: "Registration pass minted successfully",
      data: {
        wallet,
        transactionHash: result.hash,
      },
    });
  } catch (error) {
    console.error("Mint registration error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// POST /mint/ticket - Mint an event ticket
app.post("/mint/ticket", async (req, res) => {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ 
        success: false,
        error: "wallet is required" 
      });
    }

    if (!eventPassService) {
      return res.status(503).json({ 
        success: false,
        error: "EventPass service not initialized" 
      });
    }

    const result = await eventPassService.mintTicket(wallet);

    res.json({
      success: result.success,
      message: "Event ticket minted successfully",
      data: {
        wallet,
        transactionHash: result.hash,
      },
    });
  } catch (error) {
    console.error("Mint ticket error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// POST /mint/poap - Mint a POAP
app.post("/mint/poap", async (req, res) => {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ 
        success: false,
        error: "wallet is required" 
      });
    }

    if (!eventPassService) {
      return res.status(503).json({ 
        success: false,
        error: "EventPass service not initialized" 
      });
    }

    const result = await eventPassService.mintPOAP(wallet);

    res.json({
      success: result.success,
      message: "POAP minted successfully",
      data: {
        wallet,
        transactionHash: result.hash,
      },
    });
  } catch (error) {
    console.error("Mint POAP error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// GET /balance/:wallet - Get all token balances for a wallet
app.get("/balance/:wallet", async (req, res) => {
  try {
    const { wallet } = req.params;

    if (!eventPassService) {
      return res.status(503).json({ 
        success: false,
        error: "EventPass service not initialized" 
      });
    }

    const balances = await eventPassService.getAllBalances(wallet);

    res.json({
      success: true,
      data: {
        wallet,
        balances: {
          registrationPass: balances.registrationPass.toString(),
          ticket: balances.ticket.toString(),
          poap: balances.poap.toString(),
        },
      },
    });
  } catch (error) {
    console.error("Error getting balances:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// GET /balance/:wallet/:tokenId - Get specific token balance
app.get("/balance/:wallet/:tokenId", async (req, res) => {
  try {
    const { wallet, tokenId } = req.params;
    const tokenIdNum = parseInt(tokenId);

    if (isNaN(tokenIdNum) || tokenIdNum < 1 || tokenIdNum > 3) {
      return res.status(400).json({ 
        success: false,
        error: "tokenId must be 1 (REGISTRATION_PASS), 2 (EVENT_TICKET), or 3 (EVENT_POAP)" 
      });
    }

    if (!eventPassService) {
      return res.status(503).json({ 
        success: false,
        error: "EventPass service not initialized" 
      });
    }

    const balance = await eventPassService.getBalance(wallet, tokenIdNum);

    const tokenNames = {
      1: "REGISTRATION_PASS",
      2: "EVENT_TICKET",
      3: "EVENT_POAP",
    };

    res.json({
      success: true,
      data: {
        wallet,
        tokenId: tokenIdNum,
        tokenName: tokenNames[tokenIdNum],
        balance: balance.toString(),
      },
    });
  } catch (error) {
    console.error("Error getting balance:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// ==================== OMNICHAIN (CROSS-CHAIN) ROUTES ====================

// POST /omnichain/register - Register tag cross-chain
app.post("/omnichain/register", async (req, res) => {
  try {
    const { tagHash, wallet, chains } = req.body;

    if (!tagHash || !wallet) {
      return res.status(400).json({ 
        success: false,
        error: "tagHash and wallet are required" 
      });
    }

    if (!omnichainAttendeeRegistryService) {
      return res.status(503).json({ 
        success: false,
        error: "OmnichainAttendeeRegistry service not initialized" 
      });
    }

    // Convert chain names to EIDs
    const dstEids = (chains || []).map(chain => {
      const eid = CHAIN_EIDS[chain.toLowerCase()];
      if (!eid) {
        throw new Error(`Unknown chain: ${chain}`);
      }
      return eid;
    });

    if (dstEids.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "At least one destination chain is required" 
      });
    }

    const result = await omnichainAttendeeRegistryService.registerTagCrossChain(
      dstEids,
      tagHash,
      wallet,
      "0x" // Default options
    );

    res.json({
      success: result.success,
      message: "Tag registered cross-chain successfully",
      data: {
        tagHash,
        wallet,
        chains: chains || [],
        transactionHash: result.hash,
      },
    });
  } catch (error) {
    console.error("Cross-chain registration error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// POST /omnichain/mint - Cross-chain mint tokens
app.post("/omnichain/mint", async (req, res) => {
  try {
    const { wallet, tokenId, amount, chain } = req.body;

    if (!wallet || !tokenId || !chain) {
      return res.status(400).json({ 
        success: false,
        error: "wallet, tokenId, and chain are required" 
      });
    }

    if (!omnichainEventPassService) {
      return res.status(503).json({ 
        success: false,
        error: "OmnichainEventPass service not initialized" 
      });
    }

    const dstEid = CHAIN_EIDS[chain.toLowerCase()];
    if (!dstEid) {
      return res.status(400).json({ 
        success: false,
        error: `Unknown chain: ${chain}` 
      });
    }

    if (tokenId < 1 || tokenId > 3) {
      return res.status(400).json({ 
        success: false,
        error: "tokenId must be 1 (REGISTRATION_PASS), 2 (EVENT_TICKET), or 3 (EVENT_POAP)" 
      });
    }

    const result = await omnichainEventPassService.crossChainMint(
      dstEid,
      wallet,
      tokenId,
      amount || 1,
      "0x"
    );

    res.json({
      success: result.success,
      message: "Token minted cross-chain successfully",
      data: {
        wallet,
        tokenId,
        amount: amount || 1,
        chain,
        transactionHash: result.hash,
        messageId: result.messageId,
      },
    });
  } catch (error) {
    console.error("Cross-chain mint error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
});

// GET /omnichain/chains - Get available chains
app.get("/omnichain/chains", (req, res) => {
  res.json({
    success: true,
    data: {
      chains: Object.keys(CHAIN_EIDS).map(chain => ({
        name: chain,
        eid: CHAIN_EIDS[chain],
      })),
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    services: {
      attendeeRegistry: !!attendeeRegistryService,
      eventPass: !!eventPassService,
      omnichainEventPass: !!omnichainEventPassService,
      omnichainAttendeeRegistry: !!omnichainAttendeeRegistryService,
    },
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`TapPass backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
