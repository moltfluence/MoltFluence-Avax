/**
 * Agent Wallet — Autonomous AI Agent Infrastructure on Avalanche
 *
 * Uses @0xgasless/agent-sdk to provide:
 * 1. ERC-8004 — On-chain agent identity (register, reputation, validation)
 * 2. x402 payments — Gasless via 0xGasless facilitator
 * 3. Account abstraction — Agent doesn't need AVAX for gas
 *
 * The agent wallet is provisioned server-side. AI agents interact via curl —
 * they never see private keys or sign transactions. The backend handles
 * all x402 payment signing autonomously.
 *
 * Ref: https://build.avax.network/integrations/0xgasless
 * Ref: https://github.com/0xgasless/agent-sdk
 */

// Dynamic import to avoid bundling issues on Vercel serverless
let sdkInstance: any | null = null;

async function getSDK(): Promise<any | null> {
  if (sdkInstance) return sdkInstance;

  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    console.warn("[agent-wallet] AGENT_PRIVATE_KEY not set — agent wallet disabled");
    return null;
  }

  try {
    const { AgentSDK, fujiConfig } = await import("@0xgasless/agent-sdk");
    const { Wallet, JsonRpcProvider } = await import("ethers");

    const provider = new JsonRpcProvider(
      fujiConfig.networks.fuji.rpcUrl
    );
    const signer = new Wallet(privateKey, provider);

    sdkInstance = new AgentSDK({
      ...fujiConfig,
      signer,
    });

    console.log("[agent-wallet] SDK initialized on Avalanche Fuji");
    return sdkInstance;
  } catch (err) {
    console.error("[agent-wallet] SDK init failed:", (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. ERC-8004 Agent Identity
// ---------------------------------------------------------------------------

/**
 * Register the agent on-chain via ERC-8004 v0.2 IdentityRegistry.
 * This gives the agent a verifiable on-chain identity (NFT).
 */
export async function registerAgentIdentity(
  name: string,
  metadataUri: string
): Promise<{ agentId: string; txHash: string } | null> {
  const sdk = await getSDK();
  if (!sdk) return null;

  try {
    const identity = sdk.erc8004.identity();
    const result = await identity.register(metadataUri);
    console.log("[agent-wallet] Agent registered on ERC-8004:", result);
    return {
      agentId: String(result),
      txHash: typeof result === "object" && "hash" in result ? (result as any).hash : "pending",
    };
  } catch (err) {
    console.error("[agent-wallet] ERC-8004 registration failed:", (err as Error).message);
    return null;
  }
}

/**
 * Get agent reputation score from ERC-8004 ReputationRegistry.
 */
export async function getAgentReputation(
  agentId: number
): Promise<{ score: number } | null> {
  const sdk = await getSDK();
  if (!sdk) return null;

  try {
    const reputation = sdk.erc8004.reputation();
    const summary = await reputation.getSummary(agentId);
    return { score: summary.count > 0 ? Number(summary.summaryValue) / summary.count : 0 };
  } catch (err) {
    console.error("[agent-wallet] Reputation query failed:", (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 2. x402 Gasless Payments
// ---------------------------------------------------------------------------

/**
 * Make a paid API call using x402. The SDK handles:
 * - Detecting 402 Payment Required
 * - Signing ERC-3009 transferWithAuthorization
 * - Retrying with Payment-Signature header
 * - Settlement via 0xGasless facilitator (gasless)
 *
 * The agent never sees any of this — it just gets the response.
 */
export async function agentFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const sdk = await getSDK();
  if (!sdk) {
    // Fallback to regular fetch if SDK not configured
    return fetch(url, init);
  }

  try {
    return await sdk.fetch(url, init);
  } catch (err) {
    console.error("[agent-wallet] x402 fetch failed:", (err as Error).message);
    // Fallback to regular fetch
    return fetch(url, init);
  }
}

// ---------------------------------------------------------------------------
// 3. Wallet Info
// ---------------------------------------------------------------------------

/**
 * Get the agent's wallet address and balance info.
 */
export async function getAgentWalletInfo(): Promise<{
  address: string;
  network: string;
  erc8004: {
    identityRegistry: string;
    reputationRegistry: string;
    validationRegistry: string;
  };
  x402: {
    facilitatorUrl: string;
    defaultToken: string;
  };
} | null> {
  const sdk = await getSDK();
  if (!sdk) return null;

  try {
    const address = await sdk.getAddress();
    const networkConfig = sdk.getNetwork() as any;

    return {
      address,
      network: networkConfig.name ?? "fuji",
      erc8004: {
        identityRegistry: networkConfig.erc8004?.identityRegistry ?? "",
        reputationRegistry: networkConfig.erc8004?.reputationRegistry ?? "",
        validationRegistry: networkConfig.erc8004?.validationRegistry ?? "",
      },
      x402: {
        facilitatorUrl: networkConfig.x402?.facilitatorUrl ?? "",
        defaultToken: networkConfig.x402?.defaultToken ?? "",
      },
    };
  } catch (err) {
    console.error("[agent-wallet] Wallet info failed:", (err as Error).message);
    return null;
  }
}

export { getSDK };
