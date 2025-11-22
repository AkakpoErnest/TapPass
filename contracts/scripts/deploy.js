const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy AttendeeRegistry
  console.log("\nDeploying AttendeeRegistry...");
  const AttendeeRegistry = await hre.ethers.getContractFactory("AttendeeRegistry");
  const attendeeRegistry = await AttendeeRegistry.deploy();
  await attendeeRegistry.waitForDeployment();
  const attendeeRegistryAddress = await attendeeRegistry.getAddress();
  console.log("AttendeeRegistry deployed to:", attendeeRegistryAddress);

  // Deploy EventPass
  console.log("\nDeploying EventPass...");
  const EventPass = await hre.ethers.getContractFactory("EventPass");
  const eventPass = await EventPass.deploy();
  await eventPass.waitForDeployment();
  const eventPassAddress = await eventPass.getAddress();
  console.log("EventPass deployed to:", eventPassAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("AttendeeRegistry:", attendeeRegistryAddress);
  console.log("EventPass:", eventPassAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

