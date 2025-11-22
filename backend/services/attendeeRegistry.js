import { getWalletClient, getPublicClient } from "./contractService.js";
import { parseAbi, encodeFunctionData } from "viem";

// ABI for AttendeeRegistry contract
const ATTENDEE_REGISTRY_ABI = parseAbi([
  "function registerTag(bytes32 tagHash, address wallet) external",
  "function walletOf(bytes32 tagHash) public view returns (address)",
  "event TagRegistered(bytes32 indexed tagHash, address indexed wallet)",
]);

export class AttendeeRegistryService {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
  }

  /**
   * Register a tag hash to a wallet address
   * @param {string} tagHash - Hex string of the tag hash (must be 0x prefixed and 66 chars)
   * @param {string} walletAddress - Ethereum address
   * @returns {Promise<{hash: string, success: boolean}>}
   */
  async registerTag(tagHash, walletAddress) {
    try {
      // Validate inputs
      if (!tagHash || !walletAddress) {
        throw new Error("tagHash and walletAddress are required");
      }

      // Ensure tagHash is bytes32 format (0x + 64 hex chars)
      let formattedTagHash = tagHash;
      if (!tagHash.startsWith("0x")) {
        formattedTagHash = "0x" + tagHash;
      }
      
      // Pad to 66 characters (0x + 64 hex chars)
      if (formattedTagHash.length < 66) {
        formattedTagHash = formattedTagHash.padEnd(66, "0");
      } else if (formattedTagHash.length > 66) {
        formattedTagHash = formattedTagHash.slice(0, 66);
      }

      // Validate wallet address
      if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
        throw new Error("Invalid wallet address format");
      }

      const walletClient = getWalletClient();
      const publicClient = getPublicClient();

      // Check if tag is already registered
      const existingWallet = await this.getWalletOfTag(formattedTagHash);
      if (existingWallet && existingWallet !== "0x0000000000000000000000000000000000000000") {
        throw new Error("Tag already registered");
      }

      // Prepare the transaction
      const data = encodeFunctionData({
        abi: ATTENDEE_REGISTRY_ABI,
        functionName: "registerTag",
        args: [formattedTagHash, walletAddress],
      });

      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: this.contractAddress,
        data,
      });

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        hash,
        success: receipt.status === "success",
        receipt,
      };
    } catch (error) {
      console.error("Error registering tag:", error);
      throw error;
    }
  }

  /**
   * Get the wallet address associated with a tag hash
   * @param {string} tagHash - Hex string of the tag hash
   * @returns {Promise<string>} Wallet address or zero address if not registered
   */
  async getWalletOfTag(tagHash) {
    try {
      let formattedTagHash = tagHash;
      if (!tagHash.startsWith("0x")) {
        formattedTagHash = "0x" + tagHash;
      }
      
      if (formattedTagHash.length < 66) {
        formattedTagHash = formattedTagHash.padEnd(66, "0");
      } else if (formattedTagHash.length > 66) {
        formattedTagHash = formattedTagHash.slice(0, 66);
      }

      const publicClient = getPublicClient();

      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: ATTENDEE_REGISTRY_ABI,
        functionName: "walletOf",
        args: [formattedTagHash],
      });

      return result;
    } catch (error) {
      console.error("Error getting wallet of tag:", error);
      throw error;
    }
  }
}

