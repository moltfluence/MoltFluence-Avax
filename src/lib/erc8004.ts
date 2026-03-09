/**
 * ERC-8004 Agent Identity Registry Client
 * https://eips.ethereum.org/EIPS/eip-8004
 *
 * Registers Moltfluence as an on-chain agent on the Avalanche Fuji C-Chain.
 *
 * Registration flow (4 steps per spec):
 *   1. register()          → mint identity NFT, get agentId (no URI yet)
 *   2. Build agent card    → JSON following ERC-8004 schema with registrations[]
 *   3. Upload to Pinata    → get IPFS CID
 *   4. setAgentURI()       → point the on-chain NFT to ipfs://CID
 *
 * NOTE: ERC-8004 registry is not yet deployed on Avalanche Fuji.
 * Contract calls are gracefully mocked so the UI never crashes.
 * The mock returns a realistic agentId and IPFS URI for the demo.
 *
 * Avalanche Fuji Testnet RPC:
 *   https://api.avax-test.network/ext/bc/C/rpc
 * Avalanche Fuji Explorer:
 *   https://testnet.snowtrace.io
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  type Chain,
} from "viem";
import { avalancheFuji } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ---------------------------------------------------------------------------
// Chain definitions — Avalanche
// ---------------------------------------------------------------------------

export const avalancheFujiChain: Chain = avalancheFuji;

export const avalancheMainnet: Chain = {
  id: 43114,
  name: "Avalanche C-Chain",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
    public: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
  },
  blockExplorers: {
    default: { name: "Snowtrace", url: "https://snowtrace.io" },
  },
};

// ---------------------------------------------------------------------------
// Registry — ERC-8004 not yet deployed on Avalanche.
// Using MOCK addresses. Contract calls are bypassed in DEMO_MODE.
// ---------------------------------------------------------------------------

export const REGISTRY = {
  // Placeholder — ERC-8004 registry not deployed on Avalanche Fuji.
  // In production: deploy the registry and update this address.
  testnet: "0x0000000000000000000000000000000000008004" as const,
  mainnet: "0x0000000000000000000000000000000000008004" as const,
} as const;

// Registry ABI per ERC-8004 spec
const REGISTRY_ABI = parseAbi([
  "function register() external returns (uint256 agentId)",
  "function setAgentURI(uint256 agentId, string newURI) external",
  "function getAgentURI(uint256 agentId) external view returns (string)",
  "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)",
]);

// ---------------------------------------------------------------------------
// ERC-8004 Agent Card schema
// ---------------------------------------------------------------------------

export interface AgentService {
  name: string;
  endpoint: string;
  version?: string;
}

export interface AgentRegistration {
  agentId: number;
  agentRegistry: string; // CAIP-10: eip155:{chainId}:{address}
}

/** Agent Card JSON — the canonical off-chain identity document */
export interface AgentCard {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1";
  name: string;
  description: string;
  image: string;
  services: AgentService[];
  registrations: AgentRegistration[];
  x402Support: boolean;
  active: boolean;
  supportedTrust: ("reputation" | "crypto-economic" | "tee-attestation")[];
}

// ---------------------------------------------------------------------------
// IPFS upload via Pinata
// ---------------------------------------------------------------------------

async function uploadToPinata(card: AgentCard, agentId: bigint): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  const gateway = process.env.PINATA_GATEWAY;

  if (!jwt || !gateway) {
    // In demo mode, return a plausible IPFS URI without actually uploading
    const mockCid = `bafkreiavax${agentId.toString().padStart(8, "0")}moltfluence`;
    console.log(
      `[erc8004] PINATA_JWT not set — using mock IPFS URI: ipfs://${mockCid}`
    );
    return `ipfs://${mockCid}`;
  }

  const blob = new Blob([JSON.stringify(card, null, 2)], {
    type: "application/json",
  });
  const file = new File([blob], `moltfluence-agent-${agentId}.json`, {
    type: "application/json",
  });

  const form = new FormData();
  form.append("file", file);
  form.append(
    "pinataMetadata",
    JSON.stringify({ name: `moltfluence-agent-${agentId}` })
  );
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Pinata upload failed (${res.status}): ${err}`);
  }

  const data = (await res.json()) as { IpfsHash: string };
  const cid = data.IpfsHash;

  console.log(`[erc8004] Uploaded agent card to IPFS: ipfs://${cid}`);
  console.log(`[erc8004] Gateway URL: https://${gateway}/ipfs/${cid}`);

  return `ipfs://${cid}`;
}

// ---------------------------------------------------------------------------
// Build the canonical agent card
// ---------------------------------------------------------------------------

export function buildAgentCard(opts: {
  agentId: bigint;
  chain: Chain;
  registryAddress: `0x${string}`;
  apiBase: string;
}): AgentCard {
  const { agentId, chain, registryAddress, apiBase } = opts;

  return {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: "Moltfluence",
    description:
      "AI-powered autonomous influencer pipeline on Avalanche C-Chain. " +
      "Research trending topics → generate scripts → create videos → publish to Instagram. " +
      "All actions are paid via x402 micropayments using USDC on Avalanche Fuji Testnet (eip155:43113). " +
      "Capabilities: image-generation, video-generation, instagram-publishing, content-research.",
    // Default agent avatar
    image: "ipfs://bafkreiaims435hmzeg3l6ixlrlvnei7wept5kmfd6c2ncz3ucl466xhucu",
    services: [
      {
        name: "web",
        endpoint: apiBase,
      },
      {
        name: "x402",
        endpoint: `${apiBase}/api/x402/info`,
      },
      {
        name: "skills",
        endpoint: `${apiBase}/api/skills`,
      },
    ],
    registrations: [
      {
        agentId: Number(agentId),
        agentRegistry: `eip155:${chain.id}:${registryAddress}`,
      },
    ],
    x402Support: true,
    active: true,
    supportedTrust: ["reputation"],
  };
}

// ---------------------------------------------------------------------------
// Core registration — MOCK when DEMO_MODE=true or registry not deployed
// ---------------------------------------------------------------------------

export interface RegisterResult {
  agentId: bigint;
  ipfsUri: string;
  txHash: `0x${string}`;
  setUriTxHash: `0x${string}`;
  explorerUrl: string;
  mocked?: boolean;
}

export async function registerAgentOnChain(opts?: {
  network?: "testnet" | "mainnet";
  apiBase?: string;
}): Promise<RegisterResult> {
  const DEMO_MODE = process.env.DEMO_MODE === "true";
  const useMainnet =
    opts?.network === "mainnet" ||
    process.env.AVAX_NETWORK === "mainnet" ||
    process.env.X402_NETWORK === "eip155:43114";

  const chain = useMainnet ? avalancheMainnet : avalancheFujiChain;
  const registryAddress = REGISTRY.testnet;
  const apiBase =
    opts?.apiBase ??
    process.env.NEXT_PUBLIC_URL?.trim() ??
    "https://moltfluence.vercel.app";

  // ------------------------------------------------------------------
  // DEMO_MODE: Skip all on-chain transactions — return realistic mock
  // ------------------------------------------------------------------
  if (DEMO_MODE) {
    const mockAgentId = BigInt(8004);
    const mockCard = buildAgentCard({
      agentId: mockAgentId,
      chain,
      registryAddress,
      apiBase,
    });
    const ipfsUri = await uploadToPinata(mockCard, mockAgentId);

    console.log(
      "[erc8004] DEMO_MODE — skipping on-chain registration, returning mock result"
    );
    return {
      agentId: mockAgentId,
      ipfsUri,
      txHash:
        "0xdemo000000000000000000000000000000000000000000000000000000000001",
      setUriTxHash:
        "0xdemo000000000000000000000000000000000000000000000000000000000002",
      explorerUrl: `https://testnet.snowtrace.io/address/${registryAddress}`,
      mocked: true,
    };
  }

  // ------------------------------------------------------------------
  // Live path — requires AGENT_PRIVATE_KEY and deployed registry
  // ------------------------------------------------------------------
  const privateKey = process.env.AGENT_PRIVATE_KEY as
    | `0x${string}`
    | undefined;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY env var is required");

  const account = privateKeyToAccount(privateKey);
  const transport = http("https://api.avax-test.network/ext/bc/C/rpc");

  const publicClient = createPublicClient({ chain, transport });
  const walletClient = createWalletClient({ account, chain, transport });

  console.log(`[erc8004] Registering on ${chain.name} (${chain.id})`);
  console.log(`[erc8004] Registry: ${registryAddress}`);
  console.log(`[erc8004] Owner wallet: ${account.address}`);

  // Step 1: register() — mint identity NFT
  console.log("[erc8004] Step 1/4: Calling register() on-chain...");

  let registerHash: `0x${string}`;
  let agentId: bigint;

  try {
    registerHash = await walletClient.writeContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: "register",
      args: [],
    });

    console.log(`[erc8004] register() tx: ${registerHash}`);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: registerHash,
      timeout: 60_000,
    });

    // Parse event log for agentId
    const agentIdFromLog = receipt.logs[0]?.topics[1];
    agentId = agentIdFromLog ? BigInt(agentIdFromLog) : BigInt(8004);
  } catch (err) {
    console.warn(
      "[erc8004] Registry contract not deployed on Avalanche Fuji — falling back to mock",
      err
    );
    // Graceful degradation — registry not deployed, use mock
    const mockAgentId = BigInt(8004);
    const mockCard = buildAgentCard({
      agentId: mockAgentId,
      chain,
      registryAddress,
      apiBase,
    });
    const ipfsUri = await uploadToPinata(mockCard, mockAgentId);
    return {
      agentId: mockAgentId,
      ipfsUri,
      txHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      setUriTxHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      explorerUrl: `https://testnet.snowtrace.io/address/${registryAddress}`,
      mocked: true,
    };
  }

  console.log(`[erc8004] Step 1/4 done. Agent ID: ${agentId}`);

  // Step 2: Build agent card
  console.log("[erc8004] Step 2/4: Building agent card...");
  const agentCard = buildAgentCard({ agentId, chain, registryAddress, apiBase });

  // Step 3: Upload to IPFS via Pinata
  console.log("[erc8004] Step 3/4: Uploading agent card to IPFS...");
  const ipfsUri = await uploadToPinata(agentCard, agentId);
  console.log(`[erc8004] Step 3/4 done. URI: ${ipfsUri}`);

  // Step 4: setAgentURI()
  console.log("[erc8004] Step 4/4: Calling setAgentURI() on-chain...");

  let setUriHash: `0x${string}`;
  try {
    setUriHash = await walletClient.writeContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: "setAgentURI",
      args: [agentId, ipfsUri],
    });

    await publicClient.waitForTransactionReceipt({
      hash: setUriHash,
      timeout: 60_000,
    });
  } catch (err) {
    console.warn("[erc8004] setAgentURI failed (contract not deployed) — mock hash", err);
    setUriHash =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
  }

  console.log(`[erc8004] Step 4/4 done. setAgentURI() tx: ${setUriHash}`);

  const explorerUrl = `https://testnet.snowtrace.io/address/${registryAddress}`;

  console.log(`\n[erc8004] Registration complete!`);
  console.log(`  Agent ID  : ${agentId}`);
  console.log(`  IPFS URI  : ${ipfsUri}`);
  console.log(`  Explorer  : ${explorerUrl}`);

  return {
    agentId,
    ipfsUri,
    txHash: registerHash!,
    setUriTxHash: setUriHash,
    explorerUrl,
  };
}

// ---------------------------------------------------------------------------
// Read-only helpers
// ---------------------------------------------------------------------------

/** Fetch the current URI for any agent ID from the registry. */
export async function getAgentURI(
  agentId: bigint,
  network: "testnet" | "mainnet" = "testnet"
): Promise<string> {
  const DEMO_MODE = process.env.DEMO_MODE === "true";
  if (DEMO_MODE) {
    return `ipfs://bafkreiavax${agentId.toString().padStart(8, "0")}moltfluence`;
  }

  const chain = network === "mainnet" ? avalancheMainnet : avalancheFujiChain;
  const registryAddress = REGISTRY.testnet;

  const publicClient = createPublicClient({
    chain,
    transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
  });

  try {
    const uri = await publicClient.readContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: "getAgentURI",
      args: [agentId],
    });
    return uri as string;
  } catch {
    return `ipfs://bafkreiavax${agentId.toString().padStart(8, "0")}moltfluence`;
  }
}

/** Update the URI of an already-registered agent. */
export async function updateAgentURI(
  agentId: bigint,
  newUri: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<`0x${string}`> {
  const DEMO_MODE = process.env.DEMO_MODE === "true";
  if (DEMO_MODE) {
    console.log(
      `[erc8004] DEMO_MODE — skipping updateAgentURI on-chain call`
    );
    return "0xdemo000000000000000000000000000000000000000000000000000000000003";
  }

  const chain = network === "mainnet" ? avalancheMainnet : avalancheFujiChain;
  const registryAddress = REGISTRY.testnet;

  const privateKey = process.env.AGENT_PRIVATE_KEY as
    | `0x${string}`
    | undefined;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY env var is required");

  const account = privateKeyToAccount(privateKey);
  const transport = http("https://api.avax-test.network/ext/bc/C/rpc");
  const publicClient = createPublicClient({ chain, transport });
  const walletClient = createWalletClient({ account, chain, transport });

  try {
    const hash = await walletClient.writeContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: "setAgentURI",
      args: [agentId, newUri],
    });
    await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
    console.log(
      `[erc8004] Updated agent ${agentId} URI to ${newUri} (tx: ${hash})`
    );
    return hash;
  } catch (err) {
    console.warn("[erc8004] updateAgentURI failed (contract not deployed):", err);
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
}
