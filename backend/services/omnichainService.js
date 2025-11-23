import { getWalletClient, getPublicClient } from "./contractService.js";
import { parseAbi, encodeFunctionData } from "viem";

// ABI for OmnichainEventPass
const OMNICHAIN_EVENT_PASS_ABI = parseAbi([
  "function crossChainMint(uint32 _dstEid, address _to, uint256 _tokenId, uint256 _amount, bytes calldata _options) external payable returns (bytes32)",
  "function crossChainBurn(uint32 _dstEid, uint256 _tokenId, uint256 _amount, bytes calldata _options) external payable returns (bytes32)",
  "function queryCrossChainBalance(uint32 _dstEid, address _account, uint256 _tokenId, bytes calldata _options) external payable returns (bytes32)",
]);

// ABI for OmnichainAttendeeRegistry
const OMNICHAIN_REGISTRY_ABI = parseAbi([
  "function registerTagCrossChain(uint32[] calldata _dstEids, bytes32 tagHash, address wallet, bytes calldata _options) external payable",
  "function queryTagCrossChain(uint32 _dstEid, bytes32 tagHash, bytes calldata _options) external payable returns (bytes32)",
  "function getWalletOfTag(bytes32 tagHash, uint32 chainId) external view returns (address)",
]);

// LayerZero Endpoint IDs (EIDs) for different chains
export const CHAIN_EIDS = {
  sepolia: 40161,
  arbitrumSepolia: 40245,
  optimismSepolia: 40232,
  baseSepolia: 40245,
  // Mainnet
  ethereum: 30101,
  arbitrum: 30110,
  optimism: 30111,
  base: 30184,
  polygon: 30109,
};

export class OmnichainEventPassService {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
  }

  /**
   * Cross-chain mint tokens
   * @param {number} dstEid Destination chain endpoint ID
   * @param {string} to Recipient address
   * @param {number} tokenId Token ID (1, 2, or 3)
   * @param {number} amount Amount to mint
   * @param {string} options Hex-encoded options (optional)
   * @returns {Promise<{hash: string, messageId: string}>}
   */
  async crossChainMint(dstEid, to, tokenId, amount, options = "0x") {
    try {
      const walletClient = getWalletClient();
      const publicClient = getPublicClient();

      const data = encodeFunctionData({
        abi: OMNICHAIN_EVENT_PASS_ABI,
        functionName: "crossChainMint",
        args: [BigInt(dstEid), to, BigInt(tokenId), BigInt(amount), options],
      });

      // Estimate gas and get fee quote
      const value = await publicClient.estimateGas({
        account: walletClient.account,
        to: this.contractAddress,
        data,
      });

      const hash = await walletClient.sendTransaction({
        to: this.contractAddress,
        data,
        value: value * BigInt(2), // Add buffer for LayerZero fees
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Extract message ID from events if available
      const messageId = receipt.logs?.[0]?.topics?.[0] || hash;

      return {
        hash,
        messageId: messageId.toString(),
        success: receipt.status === "success",
      };
    } catch (error) {
      console.error("Error in cross-chain mint:", error);
      throw error;
    }
  }

  /**
   * Cross-chain burn tokens
   */
  async crossChainBurn(dstEid, tokenId, amount, options = "0x") {
    try {
      const walletClient = getWalletClient();
      const publicClient = getPublicClient();

      const data = encodeFunctionData({
        abi: OMNICHAIN_EVENT_PASS_ABI,
        functionName: "crossChainBurn",
        args: [BigInt(dstEid), BigInt(tokenId), BigInt(amount), options],
      });

      const value = await publicClient.estimateGas({
        account: walletClient.account,
        to: this.contractAddress,
        data,
      });

      const hash = await walletClient.sendTransaction({
        to: this.contractAddress,
        data,
        value: value * BigInt(2),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        hash,
        success: receipt.status === "success",
      };
    } catch (error) {
      console.error("Error in cross-chain burn:", error);
      throw error;
    }
  }
}

export class OmnichainAttendeeRegistryService {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
  }

  /**
   * Register tag cross-chain
   * @param {number[]} dstEids Array of destination chain EIDs
   * @param {string} tagHash Tag hash (hex string)
   * @param {string} wallet Wallet address
   * @param {string} options Hex-encoded options
   */
  async registerTagCrossChain(dstEids, tagHash, wallet, options = "0x") {
    try {
      const walletClient = getWalletClient();
      const publicClient = getPublicClient();

      // Format tagHash to bytes32
      let formattedTagHash = tagHash;
      if (!tagHash.startsWith("0x")) {
        formattedTagHash = "0x" + tagHash;
      }
      if (formattedTagHash.length < 66) {
        formattedTagHash = formattedTagHash.padEnd(66, "0");
      }

      const data = encodeFunctionData({
        abi: OMNICHAIN_REGISTRY_ABI,
        functionName: "registerTagCrossChain",
        args: [
          dstEids.map(eid => BigInt(eid)),
          formattedTagHash,
          wallet,
          options,
        ],
      });

      const value = await publicClient.estimateGas({
        account: walletClient.account,
        to: this.contractAddress,
        data,
      });

      const hash = await walletClient.sendTransaction({
        to: this.contractAddress,
        data,
        value: value * BigInt(dstEids.length + 1), // Fee for each chain
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        hash,
        success: receipt.status === "success",
      };
    } catch (error) {
      console.error("Error in cross-chain registration:", error);
      throw error;
    }
  }

  /**
   * Query tag cross-chain
   */
  async queryTagCrossChain(dstEid, tagHash, options = "0x") {
    try {
      const walletClient = getWalletClient();
      const publicClient = getPublicClient();

      let formattedTagHash = tagHash;
      if (!tagHash.startsWith("0x")) {
        formattedTagHash = "0x" + tagHash;
      }
      if (formattedTagHash.length < 66) {
        formattedTagHash = formattedTagHash.padEnd(66, "0");
      }

      const data = encodeFunctionData({
        abi: OMNICHAIN_REGISTRY_ABI,
        functionName: "queryTagCrossChain",
        args: [BigInt(dstEid), formattedTagHash, options],
      });

      const value = await publicClient.estimateGas({
        account: walletClient.account,
        to: this.contractAddress,
        data,
      });

      const hash = await walletClient.sendTransaction({
        to: this.contractAddress,
        data,
        value: value * BigInt(2),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        hash,
        success: receipt.status === "success",
      };
    } catch (error) {
      console.error("Error in cross-chain query:", error);
      throw error;
    }
  }
}

