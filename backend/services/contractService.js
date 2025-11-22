import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient } from "viem";
import { hardhat } from "viem/chains";

let walletClient;
let publicClient;
let account;

export function initializeContractService(privateKey, rpcUrl, chain = hardhat) {
  if (!privateKey) {
    throw new Error("Private key is required");
  }

  account = privateKeyToAccount(privateKey);
  
  publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl || "http://localhost:8545"),
  });

  walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl || "http://localhost:8545"),
  });

  return { walletClient, publicClient, account };
}

export function getWalletClient() {
  if (!walletClient) {
    throw new Error("Contract service not initialized. Call initializeContractService first.");
  }
  return walletClient;
}

export function getPublicClient() {
  if (!publicClient) {
    throw new Error("Contract service not initialized. Call initializeContractService first.");
  }
  return publicClient;
}

export function getAccount() {
  if (!account) {
    throw new Error("Contract service not initialized. Call initializeContractService first.");
  }
  return account;
}

