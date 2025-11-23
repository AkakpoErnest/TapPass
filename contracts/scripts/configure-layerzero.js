const hre = require("hardhat");

/**
 * Script to configure LayerZero peers and settings
 * Run this after deploying contracts on all chains
 */

// Configuration: Map of chain EID to contract address
const PEER_CONFIG = {
  // Format: { eid: "contractAddress" }
  // Example:
  // 40161: "0x...", // Sepolia
  // 40245: "0x...", // Arbitrum Sepolia
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.getNetwork();

  console.log("Configuring LayerZero peers...");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);

  // Get contract addresses from environment or deployment
  const ATTENDEE_REGISTRY_ADDRESS = process.env.ATTENDEE_REGISTRY_ADDRESS;
  const EVENT_PASS_ADDRESS = process.env.EVENT_PASS_ADDRESS;

  if (!ATTENDEE_REGISTRY_ADDRESS || !EVENT_PASS_ADDRESS) {
    throw new Error("Please set ATTENDEE_REGISTRY_ADDRESS and EVENT_PASS_ADDRESS in .env");
  }

  console.log("\nAttendeeRegistry:", ATTENDEE_REGISTRY_ADDRESS);
  console.log("EventPass:", EVENT_PASS_ADDRESS);

  // Load contracts
  const AttendeeRegistry = await hre.ethers.getContractAt(
    "OmnichainAttendeeRegistry",
    ATTENDEE_REGISTRY_ADDRESS
  );
  const EventPass = await hre.ethers.getContractAt(
    "OmnichainEventPass",
    EVENT_PASS_ADDRESS
  );

  // Configure peers
  if (Object.keys(PEER_CONFIG).length === 0) {
    console.log("\n⚠️  No peer configuration found. Please update PEER_CONFIG in this script.");
    return;
  }

  console.log("\n=== Configuring Peers ===");
  for (const [eid, peerAddress] of Object.entries(PEER_CONFIG)) {
    const eidNum = parseInt(eid);
    const peerBytes32 = hre.ethers.zeroPadValue(peerAddress, 32);

    console.log(`\nSetting peer for EID ${eidNum} (${peerAddress})...`);

    // Set peer for AttendeeRegistry
    try {
      const tx1 = await AttendeeRegistry.setPeer(eidNum, peerBytes32);
      await tx1.wait();
      console.log(`✅ AttendeeRegistry peer set for EID ${eidNum}`);
    } catch (error) {
      console.error(`❌ Failed to set AttendeeRegistry peer:`, error.message);
    }

    // Set peer for EventPass
    try {
      const tx2 = await EventPass.setPeer(eidNum, peerBytes32);
      await tx2.wait();
      console.log(`✅ EventPass peer set for EID ${eidNum}`);
    } catch (error) {
      console.error(`❌ Failed to set EventPass peer:`, error.message);
    }
  }

  console.log("\n=== Configuration Complete ===");
  console.log("Peers configured. Contracts are now ready for cross-chain messaging.");
}

main()
  .then(() => {
    console.log("\n✅ Configuration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Configuration failed:", error);
    process.exit(1);
  });

