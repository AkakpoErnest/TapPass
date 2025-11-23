/**
 * Test script for Omnichain API endpoints
 * Run: node test-omnichain.js
 */

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3000";

async function testEndpoint(method, path, body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    console.log(`\n${method} ${path}`);
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));

    return { success: response.ok, data };
  } catch (error) {
    console.error(`Error testing ${path}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🧪 Testing Omnichain API Endpoints\n");
  console.log("Base URL:", BASE_URL);

  // Test 1: Health check
  await testEndpoint("GET", "/health");

  // Test 2: Get available chains
  await testEndpoint("GET", "/omnichain/chains");

  // Test 3: Cross-chain tag registration
  await testEndpoint("POST", "/omnichain/register", {
    tagHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    chains: ["sepolia", "arbitrumSepolia"],
  });

  // Test 4: Cross-chain mint
  await testEndpoint("POST", "/omnichain/mint", {
    wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    tokenId: 1, // REGISTRATION_PASS
    amount: 1,
    chain: "arbitrumSepolia",
  });

  // Test 5: Query tag cross-chain
  await testEndpoint("GET", "/omnichain/tag/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef/sepolia");

  console.log("\n✅ Tests completed!");
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === "undefined") {
  console.error("❌ This script requires Node.js 18+ or install node-fetch");
  process.exit(1);
}

runTests().catch(console.error);



