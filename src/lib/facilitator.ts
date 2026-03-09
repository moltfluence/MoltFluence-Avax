/**
 * Self-hosted x402 facilitator using @x402/core + @x402/evm.
 * Verifies and settles ERC-3009/Permit2 payments
 * for USDC on Avalanche Fuji C-Chain Testnet (eip155:43113).
 */
import { x402Facilitator } from "@x402/core/facilitator";
import { registerExactEvmScheme } from "@x402/evm/exact/facilitator";
import { toFacilitatorEvmSigner } from "@x402/evm";
import { createPublicClient, createWalletClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import type { Network } from "@x402/core/types";

// Avalanche Fuji Testnet
const AVAX_RPC_URL =
  process.env.AVAX_RPC_URL ||
  "https://api.avax-test.network/ext/bc/C/rpc";
const X402_NETWORK = process.env.X402_NETWORK?.trim() || "eip155:43113";
const FACILITATOR_KEY = process.env.FACILITATOR_PRIVATE_KEY;

function createFacilitator(): x402Facilitator {
  if (!FACILITATOR_KEY) {
    throw new Error(
      "FACILITATOR_PRIVATE_KEY is required for self-hosted facilitator"
    );
  }

  const account = privateKeyToAccount(FACILITATOR_KEY as `0x${string}`);
  const transport = http(AVAX_RPC_URL);

  const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport,
  });

  const walletClient = createWalletClient({
    account,
    chain: avalancheFuji,
    transport,
  });

  // Combine public + wallet clients into a FacilitatorEvmSigner
  const signer = toFacilitatorEvmSigner({
    address: account.address,
    readContract: (args) => publicClient.readContract(args as any),
    verifyTypedData: (args) => publicClient.verifyTypedData(args as any),
    writeContract: (args) => walletClient.writeContract(args as any),
    sendTransaction: (args) => walletClient.sendTransaction(args as any),
    waitForTransactionReceipt: (args) =>
      publicClient.waitForTransactionReceipt(args as any).then((r) => ({
        status: r.status,
      })),
    getCode: (args) => publicClient.getCode(args as any),
  });

  const facilitator = new x402Facilitator();
  registerExactEvmScheme(facilitator, {
    signer,
    networks: X402_NETWORK as Network,
  });

  return facilitator;
}

let _instance: x402Facilitator | null = null;

export function getFacilitator(): x402Facilitator {
  if (!_instance) {
    _instance = createFacilitator();
  }
  return _instance;
}
