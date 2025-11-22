import { getWalletClient, getPublicClient } from "./contractService.js";
import { parseAbi, encodeFunctionData } from "viem";

// ABI for EventPass contract
const EVENT_PASS_ABI = parseAbi([
  "function mintRegistration(address to) external",
  "function mintTicket(address to) external",
  "function mintPOAP(address to) external",
  "function balanceOf(address account, uint256 id) public view returns (uint256)",
  "function balanceOfBatch(address[] memory accounts, uint256[] memory ids) public view returns (uint256[] memory)",
]);

export class EventPassService {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
  }

  /**
   * Mint a registration pass to an address
   * @param {string} to - Recipient address
   * @returns {Promise<{hash: string, success: boolean}>}
   */
  async mintRegistration(to) {
    return this._mintToken("mintRegistration", to);
  }

  /**
   * Mint an event ticket to an address
   * @param {string} to - Recipient address
   * @returns {Promise<{hash: string, success: boolean}>}
   */
  async mintTicket(to) {
    return this._mintToken("mintTicket", to);
  }

  /**
   * Mint a POAP to an address
   * @param {string} to - Recipient address
   * @returns {Promise<{hash: string, success: boolean}>}
   */
  async mintPOAP(to) {
    return this._mintToken("mintPOAP", to);
  }

  /**
   * Internal method to mint tokens
   * @private
   */
  async _mintToken(functionName, to) {
    try {
      if (!to || !to.startsWith("0x") || to.length !== 42) {
        throw new Error("Invalid recipient address format");
      }

      const walletClient = getWalletClient();
      const publicClient = getPublicClient();

      const data = encodeFunctionData({
        abi: EVENT_PASS_ABI,
        functionName,
        args: [to],
      });

      const hash = await walletClient.sendTransaction({
        to: this.contractAddress,
        data,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        hash,
        success: receipt.status === "success",
        receipt,
      };
    } catch (error) {
      console.error(`Error minting ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Get balance of a specific token for an address
   * @param {string} account - Address to check
   * @param {number} tokenId - Token ID (1=REGISTRATION_PASS, 2=EVENT_TICKET, 3=EVENT_POAP)
   * @returns {Promise<bigint>} Token balance
   */
  async getBalance(account, tokenId) {
    try {
      if (!account || !account.startsWith("0x") || account.length !== 42) {
        throw new Error("Invalid account address format");
      }

      const publicClient = getPublicClient();

      const balance = await publicClient.readContract({
        address: this.contractAddress,
        abi: EVENT_PASS_ABI,
        functionName: "balanceOf",
        args: [account, BigInt(tokenId)],
      });

      return balance;
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }

  /**
   * Get balances of multiple tokens for an address
   * @param {string} account - Address to check
   * @param {number[]} tokenIds - Array of token IDs
   * @returns {Promise<bigint[]>} Array of token balances
   */
  async getBalances(account, tokenIds) {
    try {
      if (!account || !account.startsWith("0x") || account.length !== 42) {
        throw new Error("Invalid account address format");
      }

      const publicClient = getPublicClient();

      const accounts = new Array(tokenIds.length).fill(account);
      const ids = tokenIds.map(id => BigInt(id));

      const balances = await publicClient.readContract({
        address: this.contractAddress,
        abi: EVENT_PASS_ABI,
        functionName: "balanceOfBatch",
        args: [accounts, ids],
      });

      return balances;
    } catch (error) {
      console.error("Error getting balances:", error);
      throw error;
    }
  }

  /**
   * Get all token balances for an address
   * @param {string} account - Address to check
   * @returns {Promise<{registrationPass: bigint, ticket: bigint, poap: bigint}>}
   */
  async getAllBalances(account) {
    try {
      const tokenIds = [1, 2, 3]; // REGISTRATION_PASS, EVENT_TICKET, EVENT_POAP
      const balances = await this.getBalances(account, tokenIds);

      return {
        registrationPass: balances[0],
        ticket: balances[1],
        poap: balances[2],
      };
    } catch (error) {
      console.error("Error getting all balances:", error);
      throw error;
    }
  }
}

