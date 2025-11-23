const hre = require("hardhat");

// LayerZero Endpoint addresses (testnet)
const LAYERZERO_ENDPOINTS = {
  // Testnet endpoints
  sepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Ethereum Sepolia
  arbitrumSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Arbitrum Sepolia
  optimismSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Optimism Sepolia
  baseSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Base Sepolia
  // Mainnet endpoints (uncomment when deploying to mainnet)
  // ethereum: "0x1a44076050125825900e736c501f859c50fE728c",
  // arbitrum: "0x1a44076050125825900e736c501f859c50fE728c",
  // optimism: "0x1a44076050125825900e736c501f859c50fE728c",
  // base: "0x1a44076050125825900e736c501f859c50fE728c",
};

// Endpoint IDs (EIDs) for different chains
const ENDPOINT_IDS = {
  sepolia: 40161,
  arbitrumSepolia: 40245,
  optimismSepolia: 40232,
  baseSepolia: 40245,
  // Mainnet
  // ethereum: 30101,
  // arbitrum: 30110,
  // optimism: 30111,
  // base: 30184,
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  console.log("Deploying Omnichain TapPass contracts...");
  console.log("Network:", network.name);
  console.log("Chain ID:", chainId);
  console.log("Deployer:", deployer.address);
  console.log("Deployer balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Get LayerZero endpoint for current network
  const networkName = network.name.toLowerCase();
  const endpointAddress = LAYERZERO_ENDPOINTS[networkName] || process.env.LAYERZERO_ENDPOINT;
  
  if (!endpointAddress) {
    throw new Error(`No LayerZero endpoint found for network: ${networkName}. Please set LAYERZERO_ENDPOINT in .env`);
  }

  console.log("\nLayerZero Endpoint:", endpointAddress);

  // Deploy OmnichainAttendeeRegistry
  console.log("\n=== Deploying OmnichainAttendeeRegistry ===");
  const OmnichainAttendeeRegistry = await hre.ethers.getContractFactory("OmnichainAttendeeRegistry");
  const attendeeRegistry = await OmnichainAttendeeRegistry.deploy(
    endpointAddress,
    deployer.address // owner/delegate
  );
  await attendeeRegistry.waitForDeployment();
  const attendeeRegistryAddress = await attendeeRegistry.getAddress();
  console.log("OmnichainAttendeeRegistry deployed to:", attendeeRegistryAddress);

  // Deploy OmnichainEventPass
  console.log("\n=== Deploying OmnichainEventPass ===");
  const OmnichainEventPass = await hre.ethers.getContractFactory("OmnichainEventPass");
  const eventPass = await OmnichainEventPass.deploy(
    endpointAddress,
    deployer.address, // owner
    "https://example.com/metadata/{id}.json" // base URI
  );
  await eventPass.waitForDeployment();
  const eventPassAddress = await eventPass.getAddress();
  console.log("OmnichainEventPass deployed to:", eventPassAddress);

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", networkName);
  console.log("Chain ID:", chainId);
  console.log("LayerZero Endpoint:", endpointAddress);
  console.log("OmnichainAttendeeRegistry:", attendeeRegistryAddress);
  console.log("OmnichainEventPass:", eventPassAddress);

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: chainId,
    deployer: deployer.address,
    layerZeroEndpoint: endpointAddress,
    contracts: {
      OmnichainAttendeeRegistry: attendeeRegistryAddress,
      OmnichainEventPass: eventPassAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Next Steps ===");
  console.log("1. Configure peers on other chains using setPeer()");
  console.log("2. Set DVN and executor configurations");
  console.log("3. Deploy to other chains with same process");
  console.log("4. Update backend .env with contract addresses");

  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

